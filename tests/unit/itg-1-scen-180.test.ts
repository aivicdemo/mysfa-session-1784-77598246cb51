import { updateDealWithObjection } from '../../src/logic/it-1-2';

describe('商談ステータスと請求データの紐付け・可視化', () => {
  // SCEN-180
  test('顧客からの異議内容が商談レコードに記録され、その後のステータス更新に反映される', () => {
    const deal_id = 'DEAL-20240115-001';
    const customer_id = 'CUST-789';
    const user_id = 'USER-456';
    const initial_status = '交渉中';
    const objection_content = '価格が高い';
    const updated_status = '課題解決中';

    const input = {
      deal_id: deal_id,
      customer_id: customer_id,
      user_id: user_id,
      current_status: initial_status,
      objection_content: objection_content,
      new_status: updated_status,
      recorded_at: new Date('2024-01-15T10:30:00Z'),
      updated_at: new Date('2024-01-15T11:00:00Z'),
    };

    const result = updateDealWithObjection(input);

    expect(result.deal_id).toBe(deal_id);
    expect(result.customer_id).toBe(customer_id);
    expect(result.user_id).toBe(user_id);
    expect(result.objection_content).toBe(objection_content);
    expect(result.previous_status).toBe(initial_status);
    expect(result.current_status).toBe(updated_status);
    expect(result.objection_preserved).toBe(true);
    expect(result.billing_data_visible).toBe(true);
    expect(result.status_consistency_valid).toBe(true);
    expect(result.update_success).toBe(true);
  });
});