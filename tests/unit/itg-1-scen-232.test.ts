import { validateDealStatusTransition } from '../../src/logic/it-1784969823049-2-1-1';

describe('商談レコードの進捗ステータスと提案内容の入力・保存機能', () => {
  // SCEN-232
  test('定義済みステータス値に基づいて正当な商談ステータス遷移が承認される', () => {
    const deal_id = 'DEAL-20240115-001';
    const customer_id = 'CUST-20240115-001';
    const deal_amount = 500000;

    // ステップ1: リード → 初期接触への遷移検証
    const transition_1_result = validateDealStatusTransition({
      deal_id: deal_id,
      current_status: 'リード',
      new_status: '初期接触',
      deal_amount: deal_amount,
      customer_id: customer_id,
      transition_timestamp: new Date('2024-01-15T09:00:00Z'),
    });

    expect(transition_1_result).toEqual({
      is_valid: true,
      status_code: 'APPROVED',
      message: 'ステータス遷移が承認されました',
      allowed_next_statuses: ['提案', 'リード'],
      transition_recorded: true,
    });

    // ステップ2: 初期接触 → 提案への遷移検証
    const transition_2_result = validateDealStatusTransition({
      deal_id: deal_id,
      current_status: '初期接触',
      new_status: '提案',
      deal_amount: deal_amount,
      customer_id: customer_id,
      transition_timestamp: new Date('2024-01-15T10:30:00Z'),
    });

    expect(transition_2_result).toEqual({
      is_valid: true,
      status_code: 'APPROVED',
      message: 'ステータス遷移が承認されました',
      allowed_next_statuses: ['交渉中', '初期接触'],
      transition_recorded: true,
    });

    // ステップ3: 提案 → 交渉中への遷移検証
    const transition_3_result = validateDealStatusTransition({
      deal_id: deal_id,
      current_status: '提案',
      new_status: '交渉中',
      deal_amount: deal_amount,
      customer_id: customer_id,
      transition_timestamp: new Date('2024-01-15T12:00:00Z'),
    });

    expect(transition_3_result).toEqual({
      is_valid: true,
      status_code: 'APPROVED',
      message: 'ステータス遷移が承認されました',
      allowed_next_statuses: ['成約', '提案'],
      transition_recorded: true,
    });

    // ステップ4: 交渉中 → 成約への遷移検証
    const transition_4_result = validateDealStatusTransition({
      deal_id: deal_id,
      current_status: '交渉中',
      new_status: '成約',
      deal_amount: deal_amount,
      customer_id: customer_id,
      transition_timestamp: new Date('2024-01-15T14:00:00Z'),
    });

    expect(transition_4_result).toEqual({
      is_valid: true,
      status_code: 'APPROVED',
      message: 'ステータス遷移が承認されました',
      allowed_next_statuses: ['完了'],
      transition_recorded: true,
    });

    // ステップ5: 変更履歴の検証
    const transition_history_result = validateDealStatusTransition({
      deal_id: deal_id,
      current_status: 'HISTORY_CHECK',
      new_status: 'HISTORY_CHECK',
      deal_amount: deal_amount,
      customer_id: customer_id,
      transition_timestamp: new Date('2024-01-15T14:00:00Z'),
      check_history: true,
    });

    expect(transition_history_result.transition_history).toBeDefined();
    expect(transition_history_result.transition_history).toHaveLength(4);
    expect(transition_history_result.transition_history[0]).toEqual({
      from_status: 'リード',
      to_status: '初期接触',
      timestamp: new Date('2024-01-15T09:00:00Z'),
      deal_id: deal_id,
    });
    expect(transition_history_result.transition_history[1]).toEqual({
      from_status: '初期接触',
      to_status: '提案',
      timestamp: new Date('2024-01-15T10:30:00Z'),
      deal_id: deal_id,
    });
    expect(transition_history_result.transition_history[2]).toEqual({
      from_status: '提案',
      to_status: '交渉中',
      timestamp: new Date('2024-01-15T12:00:00Z'),
      deal_id: deal_id,
    });
    expect(transition_history_result.transition_history[3]).toEqual({
      from_status: '交渉中',
      to_status: '成約',
      timestamp: new Date('2024-01-15T14:00:00Z'),
      deal_id: deal_id,
    });

    // 不正な遷移の検証（失注状態から成約への遷移は不可）
    const invalid_transition_result = validateDealStatusTransition({
      deal_id: 'DEAL-20240115-002',
      current_status: '失注',
      new_status: '成約',
      deal_amount: deal_amount,
      customer_id: customer_id,
      transition_timestamp: new Date('2024-01-16T09:00:00Z'),
    });

    expect(invalid_transition_result).toEqual({
      is_valid: false,
      status_code: 'REJECTED',
      message: '不正なステータス遷移です',
      allowed_next_statuses: [],
      transition_recorded: false,
    });

    // エラー: ステータスマスタに存在しないステータス値
    expect(() =>
      validateDealStatusTransition({
        deal_id: 'DEAL-20240115-003',
        current_status: '無効なステータス',
        new_status: '初期接触',
        deal_amount: deal_amount,
        customer_id: customer_id,
        transition_timestamp: new Date('2024-01-16T10:00:00Z'),
      }),
    ).toThrow(/ステータスマスタ/);

    // エラー: 空の deal_id
    expect(() =>
      validateDealStatusTransition({
        deal_id: '',
        current_status: 'リード',
        new_status: '初期接触',
        deal_amount: deal_amount,
        customer_id: customer_id,
        transition_timestamp: new Date('2024-01-16T11:00:00Z'),
      }),
    ).toThrow(/商談ID/);

    // エラー: 無効な deal_amount（負の値）
    expect(() =>
      validateDealStatusTransition({
        deal_id: 'DEAL-20240115-004',
        current_status: 'リード',
        new_status: '初期接触',
        deal_amount: -50000,
        customer_id: customer_id,
        transition_timestamp: new Date('2024-01-16T12:00:00Z'),
      }),
    ).toThrow(/金額/);
  });
});