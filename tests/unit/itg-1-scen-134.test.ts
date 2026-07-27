import { aggregateMonthlyOrderCount } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-134
  test('[normal] 当月受注件数集計機能 - ステータスが受注の商談が複数件のとき受注件数がその数と一致する', () => {
    const deal_1 = {
      deal_id: 'DEAL_001',
      customer_id: 'CUST_001',
      product_name: 'Product A',
      amount: 100000,
      status: '受注',
      deal_date: '2024-01-15',
    };

    const deal_2 = {
      deal_id: 'DEAL_002',
      customer_id: 'CUST_002',
      product_name: 'Product B',
      amount: 250000,
      status: '受注',
      deal_date: '2024-01-20',
    };

    const deal_3 = {
      deal_id: 'DEAL_003',
      customer_id: 'CUST_003',
      product_name: 'Product C',
      amount: 150000,
      status: '受注',
      deal_date: '2024-01-25',
    };

    const input_deals = [deal_1, deal_2, deal_3];
    const target_month = '2024-01';

    const result = aggregateMonthlyOrderCount(input_deals, target_month);

    expect(result.order_count).toBe(3);
  });
});