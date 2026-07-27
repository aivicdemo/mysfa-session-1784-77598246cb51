import { aggregateDealProgressByCustomer } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-176
  test('顧客別商談進捗集計機能 - 受注ステータスの商談件数が複数件のとき、その件数が正確に集計される', () => {
    // Arrange: テストデータの準備
    const customerId = 'CUST-A';
    const deals = [
      {
        dealId: 'DEAL-001',
        customerId: 'CUST-A',
        status: '受注',
        amount: 100000,
      },
      {
        dealId: 'DEAL-002',
        customerId: 'CUST-A',
        status: '受注',
        amount: 150000,
      },
      {
        dealId: 'DEAL-003',
        customerId: 'CUST-A',
        status: '受注',
        amount: 200000,
      },
    ];

    // Act: 集計ロジックの実行
    const result = aggregateDealProgressByCustomer(customerId, deals);

    // Assert: 期待結果の検証
    expect(result.customerId).toBe('CUST-A');
    expect(result.dealProgressByStatus['受注'].count).toBe(3);
    expect(result.dealProgressByStatus['受注'].totalAmount).toBe(450000);
  });
});