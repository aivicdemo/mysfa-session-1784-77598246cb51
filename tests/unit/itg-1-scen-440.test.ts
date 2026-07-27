import { getCustomerDealHistory } from '../../src/logic/it-1';

describe('顧客レコード画面の商談履歴・活動記録表示', () => {
  // SCEN-440
  test('商談履歴が1件の顧客レコードを表示するとき、その1件が返される', async () => {
    const customer_id = 'CUST-001';
    const deal_id = 'DEAL-001';
    const deal_name = '○○案件';
    const deal_status = '提案中';
    const deal_amount = 500000;
    const deal_created_date = '2024-01-15';

    const mock_deal_record = {
      deal_id: deal_id,
      deal_name: deal_name,
      status: deal_status,
      amount: deal_amount,
      created_date: deal_created_date,
    };

    const result = await getCustomerDealHistory(customer_id);

    expect(result).toEqual([mock_deal_record]);
    expect(result.length).toBe(1);
    expect(result[0].deal_id).toBe('DEAL-001');
    expect(result[0].deal_name).toBe('○○案件');
    expect(result[0].status).toBe('提案中');
    expect(result[0].amount).toBe(500000);
    expect(result[0].created_date).toBe('2024-01-15');
  });
});