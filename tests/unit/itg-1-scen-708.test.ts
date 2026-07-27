import { determineRoutingDecision } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-708
  test('段階的対応ルーティング機能 - 照合結果が確定後、同じ入力で2回実行した場合、2回目も同じ対応ルーティング結果が返される', () => {
    const customer_info = {
      customer_id: 'CUST-001',
      industry: '製造業',
      sales_scale: '大企業',
    };

    const first_execution_result = determineRoutingDecision(customer_info);

    expect(first_execution_result).toEqual({
      status: 'CONFIRMED',
      assigned_sales_user: 'sales-user-A',
      priority_level: '高',
      recommended_initial_contact: '初回面談',
    });

    const first_assigned_sales_user = first_execution_result.assigned_sales_user;
    const first_priority_level = first_execution_result.priority_level;
    const first_recommended_initial_contact = first_execution_result.recommended_initial_contact;

    expect(first_execution_result.status).toBe('CONFIRMED');

    const second_execution_result = determineRoutingDecision(customer_info);

    expect(second_execution_result.status).toBe('CONFIRMED');
    expect(second_execution_result.assigned_sales_user).toBe(first_assigned_sales_user);
    expect(second_execution_result.assigned_sales_user).toBe('sales-user-A');
    expect(second_execution_result.priority_level).toBe(first_priority_level);
    expect(second_execution_result.priority_level).toBe('高');
    expect(second_execution_result.recommended_initial_contact).toBe(first_recommended_initial_contact);
    expect(second_execution_result.recommended_initial_contact).toBe('初回面談');

    expect(second_execution_result).toEqual(first_execution_result);
  });
});