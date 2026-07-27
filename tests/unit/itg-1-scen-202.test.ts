import { aggregateDealProgressByCustomer } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-202
  test('顧客別商談進捗集計機能 - 商談データに重複レコードが含まれるとき、重複した分のみ別途集計される', () => {
    // Arrange: テストデータ準備
    const customerId = 'CUST-001';
    const dealAmount = 1000000; // 100万円

    // 通常の商談レコード（重複していない）
    const normalDeal1 = {
      dealId: 'DEAL-001',
      customerId: customerId,
      dealName: '商談1',
      amount: dealAmount,
      status: '初期接触',
      createdAt: new Date('2024-01-10T09:00:00Z'),
    };

    const normalDeal2 = {
      dealId: 'DEAL-002',
      customerId: customerId,
      dealName: '商談2',
      amount: dealAmount,
      status: '提案中',
      createdAt: new Date('2024-01-15T10:00:00Z'),
    };

    // 重複した商談レコード（同じ案件ID、金額、進捗ステージ）
    const duplicateDeal1 = {
      dealId: 'DEAL-001',
      customerId: customerId,
      dealName: '商談1',
      amount: dealAmount,
      status: '初期接触',
      createdAt: new Date('2024-01-10T09:00:00Z'),
    };

    const deals = [normalDeal1, normalDeal2, duplicateDeal1];

    // Act: 顧客別商談進捗集計機能を実行
    const result = aggregateDealProgressByCustomer(customerId, deals);

    // Assert: 集計結果を検証
    // 正規レコード数: 2件（DEAL-001とDEAL-002）
    // 重複レコード数: 1件（DEAL-001の重複）
    expect(result.normalDealsCount).toBe(2);
    expect(result.duplicateDealsCount).toBe(1);

    // 正規商談の合計金額: 100万円 × 2件 = 200万円
    expect(result.normalDealsTotalAmount).toBe(2000000);

    // 重複商談の合計金額: 100万円 × 1件 = 100万円
    expect(result.duplicateDealsTotalAmount).toBe(1000000);

    // ステータス別集計（正規レコードのみ）
    expect(result.normalDealsByStatus).toEqual({
      '初期接触': {
        count: 1,
        totalAmount: 1000000,
      },
      '提案中': {
        count: 1,
        totalAmount: 1000000,
      },
    });

    // 重複レコード集計（ステータス別）
    expect(result.duplicateDealsByStatus).toEqual({
      '初期接触': {
        count: 1,
        totalAmount: 1000000,
      },
    });

    // 全レコード数の一致を確認
    // 正規レコード数（2） + 重複レコード数（1） = 3
    expect(result.totalRecordsProcessed).toBe(3);

    // 重複メッセージの確認
    expect(result.duplicateNotification).toContain('重複レコード数：1件');
  });
});