import { aggregateDealsByCustomer } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-206
  test('顧客別商談進捗集計機能 - 同じ入力データで2回実行したとき、同じ集計結果が得られる', () => {
    const test_deals = [
      {
        deal_id: 'D001',
        customer_id: 'C_A',
        customer_name: '顧客A',
        deal_name: '案件1',
        stage: '提案中',
        amount: 100000,
        updated_at: new Date('2024-01-15T10:00:00Z'),
      },
      {
        deal_id: 'D002',
        customer_id: 'C_A',
        customer_name: '顧客A',
        deal_name: '案件2',
        stage: '提案中',
        amount: 150000,
        updated_at: new Date('2024-01-16T10:00:00Z'),
      },
      {
        deal_id: 'D003',
        customer_id: 'C_A',
        customer_name: '顧客A',
        deal_name: '案件3',
        stage: '提案中',
        amount: 120000,
        updated_at: new Date('2024-01-17T10:00:00Z'),
      },
      {
        deal_id: 'D004',
        customer_id: 'C_A',
        customer_name: '顧客A',
        deal_name: '案件4',
        stage: '受注',
        amount: 200000,
        updated_at: new Date('2024-01-18T10:00:00Z'),
      },
      {
        deal_id: 'D005',
        customer_id: 'C_A',
        customer_name: '顧客A',
        deal_name: '案件5',
        stage: '受注',
        amount: 250000,
        updated_at: new Date('2024-01-19T10:00:00Z'),
      },
      {
        deal_id: 'D006',
        customer_id: 'C_B',
        customer_name: '顧客B',
        deal_name: '案件6',
        stage: '初期接触',
        amount: 50000,
        updated_at: new Date('2024-01-15T11:00:00Z'),
      },
      {
        deal_id: 'D007',
        customer_id: 'C_B',
        customer_name: '顧客B',
        deal_name: '案件7',
        stage: '交渉中',
        amount: 180000,
        updated_at: new Date('2024-01-20T11:00:00Z'),
      },
      {
        deal_id: 'D008',
        customer_id: 'C_C',
        customer_name: '顧客C',
        deal_name: '案件8',
        stage: '失注',
        amount: 75000,
        updated_at: new Date('2024-01-15T12:00:00Z'),
      },
      {
        deal_id: 'D009',
        customer_id: 'C_C',
        customer_name: '顧客C',
        deal_name: '案件9',
        stage: '受注',
        amount: 300000,
        updated_at: new Date('2024-01-21T12:00:00Z'),
      },
    ];

    const first_result = aggregateDealsByCustomer(test_deals);
    const second_result = aggregateDealsByCustomer(test_deals);

    expect(first_result).toEqual(second_result);

    expect(first_result).toEqual({
      customers: [
        {
          customer_id: 'C_A',
          customer_name: '顧客A',
          total_deals: 5,
          stage_breakdown: {
            '提案中': {
              count: 3,
              total_amount: 370000,
            },
            '受注': {
              count: 2,
              total_amount: 450000,
            },
          },
          total_amount: 820000,
        },
        {
          customer_id: 'C_B',
          customer_name: '顧客B',
          total_deals: 2,
          stage_breakdown: {
            '初期接触': {
              count: 1,
              total_amount: 50000,
            },
            '交渉中': {
              count: 1,
              total_amount: 180000,
            },
          },
          total_amount: 230000,
        },
        {
          customer_id: 'C_C',
          customer_name: '顧客C',
          total_deals: 2,
          stage_breakdown: {
            '失注': {
              count: 1,
              total_amount: 75000,
            },
            '受注': {
              count: 1,
              total_amount: 300000,
            },
          },
          total_amount: 375000,
        },
      ],
      summary: {
        total_customers: 3,
        total_deals: 9,
        grand_total_amount: 1425000,
      },
    });
  });
});