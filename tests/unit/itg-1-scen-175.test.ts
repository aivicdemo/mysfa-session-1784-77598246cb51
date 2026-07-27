import { aggregateDealProgressByCustomer } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-175
  test('受注ステータスの商談件数が1件のとき、その件数が1として集計される', () => {
    const customer_id = 'CUST001';
    const customer_name = 'テスト顧客A';

    const deal_id = 'DEAL001';
    const deal_status = '受注';
    const deal_amount = 500000;

    const deals = [
      {
        id: deal_id,
        customer_id: customer_id,
        status: deal_status,
        amount: deal_amount,
      },
    ];

    const result = aggregateDealProgressByCustomer({
      customer_id: customer_id,
      deals: deals,
    });

    expect(result).toEqual({
      customer_id: customer_id,
      deal_count_by_status: {
        initial_contact: 0,
        proposal: 0,
        negotiation: 0,
        closed: 1,
        lost: 0,
      },
      total_amount_by_status: {
        initial_contact: 0,
        proposal: 0,
        negotiation: 0,
        closed: 500000,
        lost: 0,
      },
    });

    expect(result.deal_count_by_status.closed).toBe(1);
  });
});