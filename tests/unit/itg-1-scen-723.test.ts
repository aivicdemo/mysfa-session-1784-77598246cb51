import { validateDealStatusTransition } from '../../src/logic/it-1784969823049-2-1-1';

describe('商談レコードの進捗ステータスと提案内容の入力・保存機能', () => {
  // SCEN-723: [normal] 商談ステータス遷移検証機能 - 初期ステータスから次の正当なステータスへ遷移できる
  test('初期ステータス「新規」から「提案中」への遷移が正常に完了し、ステータスが永続化される', () => {
    const deal_id = 'DEAL-001';
    const current_status = '新規';
    const next_status = '提案中';
    const user_id = 'USR-ADMIN-001';
    const transition_timestamp = new Date('2024-01-15T11:00:00Z');

    const result = validateDealStatusTransition({
      deal_id,
      current_status,
      next_status,
      user_id,
      transition_timestamp,
    });

    expect(result.is_valid).toBe(true);
    expect(result.updated_status).toBe('提案中');
    expect(result.status_history_entry).toEqual({
      deal_id,
      previous_status: '新規',
      new_status: '提案中',
      changed_by_user_id: 'USR-ADMIN-001',
      changed_at: new Date('2024-01-15T11:00:00Z'),
    });
    expect(result.persisted).toBe(true);
  });
});