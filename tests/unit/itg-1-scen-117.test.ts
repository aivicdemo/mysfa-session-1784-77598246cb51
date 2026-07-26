import { aggregateMonthlySalesMetrics } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-117
  test('当月売上集計機能 - 受注件数が0の場合に進捗率が0%と算出される', () => {
    // Arrange
    const dealRecords = [
      {
        id: 'deal_001',
        customerId: 'cust_001',
        status: '初期接触',
        amount: 500000,
        createdDate: '2024-04-05',
      },
      {
        id: 'deal_002',
        customerId: 'cust_002',
        status: '提案中',
        amount: 300000,
        createdDate: '2024-04-10',
      },
      {
        id: 'deal_003',
        customerId: 'cust_003',
        status: '交渉中',
        amount: 200000,
        createdDate: '2024-04-15',
      },
    ];

    const targetMonth = '2024-04';

    // Act
    const result = aggregateMonthlySalesMetrics({
      dealRecords,
      targetMonth,
    });

    // Assert - 受注件数が0のため、売上合計は0、進捗率は0%
    expect(result.totalRevenue).toBe(0);
    expect(result.closedDealCount).toBe(0);
    expect(result.progressRate).toBe(0);
  });
});