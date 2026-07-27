import { aggregateDealProgressByCustomer } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-203
  test('顧客別商談進捗集計機能 - 金額が負数の商談が含まれるとき、その金額が合計から差し引かれる', () => {
    const deals = [
      {
        deal_id: 'deal_001',
        customer_id: 'cust_001',
        amount: 100000,
        status: '成約',
      },
      {
        deal_id: 'deal_002',
        customer_id: 'cust_001',
        amount: -50000,
        status: '成約',
      },
      {
        deal_id: 'deal_003',
        customer_id: 'cust_001',
        amount: 75000,
        status: '成約',
      },
    ];

    const result = aggregateDealProgressByCustomer(deals);

    expect(result).toEqual([
      {
        customer_id: 'cust_001',
        total_amount: 125000,
        deal_count_by_status: {
          '成約': 3,
        },
        deals_by_status: {
          '成約': [
            {
              deal_id: 'deal_001',
              amount: 100000,
              status: '成約',
            },
            {
              deal_id: 'deal_002',
              amount: -50000,
              status: '成約',
            },
            {
              deal_id: 'deal_003',
              amount: 75000,
              status: '成約',
            },
          ],
        },
      },
    ]);
  });
});