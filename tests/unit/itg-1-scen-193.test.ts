import { aggregateCustomerDealProgress } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-193
  test('顧客別商談進捗集計機能 - 失注ステータスの商談が1件で金額が0円を超えるとき、その金額が正確に集計される', () => {
    const customerId = 'CUST-001';
    const dealAmount = 150000;
    const dealStatus = '失注';

    const deals = [
      {
        customer_id: customerId,
        status: dealStatus,
        amount: dealAmount,
      },
    ];

    const result = aggregateCustomerDealProgress(deals);

    const customerAggregate = result.find(
      (agg) => agg.customer_id === customerId
    );

    expect(customerAggregate).toBeDefined();
    expect(customerAggregate?.lost_total_amount).toBe(150000);
  });
});