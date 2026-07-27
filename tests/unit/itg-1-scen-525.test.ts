import { reconcile } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-525
  test('[normal] 同じ商談に対して照合処理を2回実行したとき、両回で同じズレ検出結果が返される', () => {
    // テスト用の商談データを作成
    const deal = {
      id: 'DEAL-001',
      status: '成約',
      amount: 100000,
    };

    // テスト用の請求書データを作成
    const invoice = {
      id: 'INV-001',
      dealId: 'DEAL-001',
      status: '未発行',
      amount: 100000,
    };

    // 第1回目の照合処理を実行
    const result1 = reconcile([deal], [invoice]);

    // 第2回目の照合処理を実行（同じ商談に対して）
    const result2 = reconcile([deal], [invoice]);

    // ズレ検出結果が存在することを確認
    expect(result1.discrepancies).toBeDefined();
    expect(result2.discrepancies).toBeDefined();
    expect(result1.discrepancies.length).toBeGreaterThan(0);
    expect(result2.discrepancies.length).toBeGreaterThan(0);

    // 両回で同じズレが検出されていることを確認
    expect(result1.discrepancies.length).toBe(result2.discrepancies.length);

    // 最初のズレ検出結果を詳細比較
    const discrepancy1 = result1.discrepancies[0];
    const discrepancy2 = result2.discrepancies[0];

    // dealIdが一致
    expect(discrepancy1.dealId).toBe('DEAL-001');
    expect(discrepancy2.dealId).toBe('DEAL-001');
    expect(discrepancy1.dealId).toBe(discrepancy2.dealId);

    // mismatchTypeが一致
    expect(discrepancy1.mismatchType).toBe('ステータス不一致');
    expect(discrepancy2.mismatchType).toBe('ステータス不一致');
    expect(discrepancy1.mismatchType).toBe(discrepancy2.mismatchType);

    // 詳細内容が一致
    expect(discrepancy1.dealStatus).toBe('成約');
    expect(discrepancy2.dealStatus).toBe('成約');
    expect(discrepancy1.invoiceStatus).toBe('未発行');
    expect(discrepancy2.invoiceStatus).toBe('未発行');

    // timestampの日付部分が一致
    const timestamp1_date = new Date(discrepancy1.timestamp).toDateString();
    const timestamp2_date = new Date(discrepancy2.timestamp).toDateString();
    expect(timestamp1_date).toBe(timestamp2_date);

    // invoiceIdも一致
    expect(discrepancy1.invoiceId).toBe('INV-001');
    expect(discrepancy2.invoiceId).toBe('INV-001');
  });
});