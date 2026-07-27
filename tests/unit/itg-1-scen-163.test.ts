import { aggregateDealProgressByCustomer } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-163
  test('顧客に紐付く商談が1件のとき、その商談が正しいステータスと金額で集計される', () => {
    const customer_id = 'CUST-001';
    const deal_id = 'DEAL-001';
    const deal_status = '提案中';
    const deal_amount = 500000;

    const deals = [
      {
        deal_id: deal_id,
        customer_id: customer_id,
        status: deal_status,
        amount: deal_amount,
      },
    ];

    const result = aggregateDealProgressByCustomer(deals);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          customer_id: customer_id,
          total_deal_count: 1,
          status_breakdown: expect.objectContaining({
            '提案中': 1,
          }),
          total_amount: 500000,
        }),
      ])
    );

    const customer_result = result.find((r) => r.customer_id === customer_id);
    expect(customer_result).toBeDefined();
    expect(customer_result?.total_deal_count).toBe(1);
    expect(customer_result?.status_breakdown['提案中']).toBe(1);
    expect(customer_result?.total_amount).toBe(500000);
  });
});