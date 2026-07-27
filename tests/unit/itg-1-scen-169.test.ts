import { aggregateDealProgressByCustomer } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-169: [edge] 顧客別商談進捗集計機能 - 提案中ステータスの商談件数が1件のとき、その件数が1として集計される
  test('should aggregate deal count for proposal status as 1 when exactly one deal with proposal status exists for a customer', () => {
    const customerId = 'CUST-001';
    const dealRecords = [
      {
        deal_id: 'DEAL-001',
        customer_id: customerId,
        status: '提案中',
        amount: 500000,
        created_at: '2024-01-15T10:00:00Z',
      },
    ];

    const result = aggregateDealProgressByCustomer(dealRecords);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          customer_id: customerId,
          status_breakdown: expect.objectContaining({
            '提案中': expect.objectContaining({
              count: 1,
              total_amount: 500000,
            }),
          }),
        }),
      ])
    );

    const customerAggregation = result.find(
      (agg) => agg.customer_id === customerId
    );
    expect(customerAggregation?.status_breakdown['提案中']?.count).toBe(1);
  });
});