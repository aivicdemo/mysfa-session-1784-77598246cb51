import { updateDealStatusWithHistory } from '../../src/logic/it-1784969823049-2-1-1';

describe('商談レコードの進捗ステータスと提案内容の入力・保存機能', () => {
  // SCEN-221
  test('商談ステータスの更新時に、ステータス履歴が自動的に記録される', () => {
    const deal_id = 'DEAL-20240115-001';
    const user_id = 'USER-sales-001';
    const user_name = '山田太郎';
    const previous_status = '初期接触';
    const new_status = '提案中';
    const timestamp_before_update = new Date('2024-01-15T09:00:00Z');
    const timestamp_after_update = new Date('2024-01-15T10:30:00Z');

    const input_deal = {
      deal_id: deal_id,
      deal_name: 'ABC株式会社との商談',
      current_status: previous_status,
      amount: 500000,
      customer_id: 'CUST-001',
      customer_name: 'ABC株式会社',
    };

    const status_history_before = [
      {
        history_id: 'HIST-001',
        deal_id: deal_id,
        previous_status: null,
        new_status: '初期接触',
        changed_at: timestamp_before_update,
        changed_by_user_id: 'USER-admin-001',
        changed_by_user_name: '管理者',
      },
    ];

    const update_request = {
      deal_id: deal_id,
      new_status: new_status,
      user_id: user_id,
      user_name: user_name,
      changed_at: timestamp_after_update,
    };

    const result = updateDealStatusWithHistory(
      input_deal,
      status_history_before,
      update_request
    );

    expect(result.deal.current_status).toBe(new_status);
    expect(result.deal.deal_id).toBe(deal_id);
    expect(result.deal.deal_name).toBe('ABC株式会社との商談');
    expect(result.deal.amount).toBe(500000);
    expect(result.deal.customer_id).toBe('CUST-001');
    expect(result.deal.customer_name).toBe('ABC株式会社');

    expect(result.status_history).toHaveLength(2);

    const new_history_record = result.status_history[1];
    expect(new_history_record.deal_id).toBe(deal_id);
    expect(new_history_record.previous_status).toBe(previous_status);
    expect(new_history_record.new_status).toBe(new_status);
    expect(new_history_record.changed_at).toEqual(timestamp_after_update);
    expect(new_history_record.changed_by_user_id).toBe(user_id);
    expect(new_history_record.changed_by_user_name).toBe(user_name);

    expect(result.status_history[0]).toEqual(status_history_before[0]);

    const third_update_request = {
      deal_id: deal_id,
      new_status: '交渉中',
      user_id: 'USER-sales-002',
      user_name: '佐藤花子',
      changed_at: new Date('2024-01-15T14:00:00Z'),
    };

    const result_after_second_update = updateDealStatusWithHistory(
      result.deal,
      result.status_history,
      third_update_request
    );

    expect(result_after_second_update.deal.current_status).toBe('交渉中');
    expect(result_after_second_update.status_history).toHaveLength(3);

    const second_new_history = result_after_second_update.status_history[2];
    expect(second_new_history.previous_status).toBe(new_status);
    expect(second_new_history.new_status).toBe('交渉中');
    expect(second_new_history.changed_by_user_id).toBe('USER-sales-002');
    expect(second_new_history.changed_by_user_name).toBe('佐藤花子');

    expect(result_after_second_update.status_history[0]).toEqual(status_history_before[0]);
    expect(result_after_second_update.status_history[1]).toEqual(new_history_record);
  });
});