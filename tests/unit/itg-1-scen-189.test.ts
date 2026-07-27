import { aggregateDealProgressByCustomer } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-189
  test('顧客別商談進捗集計機能 - 受注ステータスの商談合計金額が0円のとき、その金額が0として集計される', () => {
    // Arrange
    const customer_id = 'CUST-001';
    const deals = [
      {
        deal_id: 'DEAL-001',
        customer_id: customer_id,
        status: '受注',
        amount: 0,
      },
      {
        deal_id: 'DEAL-002',
        customer_id: customer_id,
        status: '受注',
        amount: 0,
      },
      {
        deal_id: 'DEAL-003',
        customer_id: customer_id,
        status: '受注',
        amount: 0,
      },
    ];

    // Act
    const result = aggregateDealProgressByCustomer(deals);

    // Assert
    const customer_aggregation = result.find(
      (agg) => agg.customer_id === customer_id
    );
    expect(customer_aggregation).toBeDefined();
    expect(customer_aggregation?.status_breakdown).toBeDefined();

    const won_status_breakdown = customer_aggregation?.status_breakdown.find(
      (breakdown) => breakdown.status === '受注'
    );
    expect(won_status_breakdown).toBeDefined();
    expect(won_status_breakdown?.total_amount).toBe(0);
    expect(won_status_breakdown?.deal_count).toBe(3);
  });
});