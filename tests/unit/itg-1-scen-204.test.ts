import { aggregateDealsByCustomer } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-204
  test('顧客別商談進捗集計機能 - 金額が非常に大きな数値の商談が含まれるとき、正確に集計される', () => {
    const customer_id = 'CUST001';
    const deals = [
      {
        deal_id: 'DEAL001',
        customer_id: customer_id,
        amount: 9999999999,
        status: '受注',
      },
      {
        deal_id: 'DEAL002',
        customer_id: customer_id,
        amount: 1500000,
        status: '受注',
      },
      {
        deal_id: 'DEAL003',
        customer_id: customer_id,
        amount: 850000,
        status: '受注',
      },
      {
        deal_id: 'DEAL004',
        customer_id: customer_id,
        amount: 3200000,
        status: '受注',
      },
    ];

    const result = aggregateDealsByCustomer(deals, customer_id);

    expect(result.total_amount).toBe(10004549999);
    expect(result.deal_count).toBe(4);
    expect(result.average_amount).toBe(2501137499.75);
  });
});