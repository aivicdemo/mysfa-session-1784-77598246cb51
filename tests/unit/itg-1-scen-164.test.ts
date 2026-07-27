import { aggregateDealProgressByCustomer } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-164
  test('顧客別商談進捗集計機能 - 顧客に紐付く商談が複数件のとき、全件がステータス別に正しく分類される', () => {
    const customer_id = 'CUST_001';
    const deals = [
      {
        deal_id: 'DEAL_001',
        customer_id,
        status: '提案中',
        amount: 100000,
      },
      {
        deal_id: 'DEAL_002',
        customer_id,
        status: '提案中',
        amount: 150000,
      },
      {
        deal_id: 'DEAL_003',
        customer_id,
        status: '交渉中',
        amount: 200000,
      },
      {
        deal_id: 'DEAL_004',
        customer_id,
        status: '成約',
        amount: 250000,
      },
      {
        deal_id: 'DEAL_005',
        customer_id,
        status: '失注',
        amount: 50000,
      },
    ];

    const result = aggregateDealProgressByCustomer(customer_id, deals);

    expect(result).toEqual({
      customer_id,
      status_breakdown: {
        提案中: {
          count: 2,
          total_amount: 250000,
        },
        交渉中: {
          count: 1,
          total_amount: 200000,
        },
        成約: {
          count: 1,
          total_amount: 250000,
        },
        失注: {
          count: 1,
          total_amount: 50000,
        },
      },
      total_deal_count: 5,
    });
  });
});