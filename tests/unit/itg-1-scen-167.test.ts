import { aggregateDealProgressByCustomer } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-167
  test('顧客別商談進捗集計機能 - 初期接触ステータスの商談件数が複数件のとき、その件数が正確に集計される', () => {
    const customer_id = 'C001';
    const contact_status = '初期接触';
    const proposal_status = '提案中';
    const success_status = '商談成立';

    const initial_deals = [
      {
        deal_id: 'D001',
        customer_id: customer_id,
        status: contact_status,
        amount: 100000,
      },
      {
        deal_id: 'D002',
        customer_id: customer_id,
        status: contact_status,
        amount: 150000,
      },
      {
        deal_id: 'D003',
        customer_id: customer_id,
        status: contact_status,
        amount: 200000,
      },
    ];

    const result_first = aggregateDealProgressByCustomer(initial_deals, customer_id);

    expect(result_first).toEqual({
      customer_id: customer_id,
      progress_summary: [
        {
          status: contact_status,
          count: 3,
          total_amount: 450000,
        },
        {
          status: proposal_status,
          count: 0,
          total_amount: 0,
        },
        {
          status: success_status,
          count: 0,
          total_amount: 0,
        },
      ],
    });

    const additional_deals = [
      ...initial_deals,
      {
        deal_id: 'D004',
        customer_id: customer_id,
        status: proposal_status,
        amount: 300000,
      },
      {
        deal_id: 'D005',
        customer_id: customer_id,
        status: proposal_status,
        amount: 250000,
      },
      {
        deal_id: 'D006',
        customer_id: customer_id,
        status: success_status,
        amount: 500000,
      },
    ];

    const result_second = aggregateDealProgressByCustomer(
      additional_deals,
      customer_id
    );

    expect(result_second).toEqual({
      customer_id: customer_id,
      progress_summary: [
        {
          status: contact_status,
          count: 3,
          total_amount: 450000,
        },
        {
          status: proposal_status,
          count: 2,
          total_amount: 550000,
        },
        {
          status: success_status,
          count: 1,
          total_amount: 500000,
        },
      ],
    });

    const initial_contact_count_first = result_first.progress_summary.find(
      (summary) => summary.status === contact_status
    )?.count;
    const initial_contact_count_second = result_second.progress_summary.find(
      (summary) => summary.status === contact_status
    )?.count;

    expect(initial_contact_count_first).toBe(3);
    expect(initial_contact_count_second).toBe(3);
    expect(initial_contact_count_first).toStrictEqual(
      initial_contact_count_second
    );
  });
});