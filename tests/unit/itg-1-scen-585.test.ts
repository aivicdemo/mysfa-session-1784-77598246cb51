import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-585: [edge] 商談ステータスと請求書の自動照合・遅延案件検出 - 月をまたいだ期間で請求予定日を持つ案件が遅延となった場合、遅延案件として正しく判定される
  test('月をまたいだ期間での遅延案件検出が正しく機能することを確認', async () => {
    // テスト対象モジュールのインポート
    const { detectDelayedDeals } = await import(
      '../../src/logic/it-1784969823049-1-1-1'
    );

    // 現在日時を 2024-02-15 に固定（Jest のタイムモック使用）
    const fixedCurrentDate = new Date('2024-02-15T00:00:00Z');
    jest.useFakeTimers();
    jest.setSystemTime(fixedCurrentDate);

    try {
      // テスト用データの準備
      const testDeal = {
        deal_id: 'DEAL-001',
        customer_name: 'テスト顧客',
        billing_scheduled_date: new Date('2024-01-31T00:00:00Z'),
        status: '受注',
        amount: 100000,
      };

      const testInvoice = {
        invoice_id: 'INV-001',
        deal_id: 'DEAL-001',
        invoice_status: '未払い',
        amount: 100000,
        issued_date: new Date('2024-01-31T00:00:00Z'),
        payment_due_date: new Date('2024-02-14T00:00:00Z'),
      };

      // 遅延案件検出ロジックを実行
      const delayedDealsResult = await detectDelayedDeals([testDeal], [testInvoice]);

      // 検出結果の検証
      expect(delayedDealsResult).toBeDefined();
      expect(delayedDealsResult.length).toBe(1);

      const detectedDeal = delayedDealsResult[0];

      // 遅延判定フラグの確認
      expect(detectedDeal.is_delayed).toBe(true);

      // 遅延日数の確認（2024-02-14 から 2024-02-15 まで 1 日）
      expect(detectedDeal.delay_days).toBe(1);

      // 遅延理由の確認
      expect(detectedDeal.delay_reason).toMatch(/支払期限切れ/);
      expect(detectedDeal.delay_reason).toMatch(/2024-02-14/);

      // 遅延検出日時の確認（2024-02-15）
      expect(detectedDeal.detected_at).toEqual(fixedCurrentDate);

      // 月をまたいだ期間の計算確認
      expect(detectedDeal.billing_scheduled_date).toEqual(new Date('2024-01-31T00:00:00Z'));
      expect(detectedDeal.payment_due_date).toEqual(new Date('2024-02-14T00:00:00Z'));

      // 商談ID の確認
      expect(detectedDeal.deal_id).toBe('DEAL-001');
    } finally {
      jest.useRealTimers();
    }
  });
});