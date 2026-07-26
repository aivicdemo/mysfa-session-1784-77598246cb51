import { validateDealStatusTransition } from '../../src/logic/it-1784969823049-2-1-1';

describe('商談レコードの進捗ステータスと提案内容の入力・保存機能', () => {
  // SCEN-194
  test('正当なステータス遷移（提案中→受注）が承認される', () => {
    const current_deal = {
      deal_id: 'DEAL-001',
      customer_id: 'CUST-001',
      customer_name: '株式会社テスト',
      status: '提案中',
      amount: 1000000,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:30:00Z',
      detail_items: [
        {
          item_id: 'ITEM-001',
          product_name: '営業管理システムライセンス',
          quantity: 10,
          unit_price: 100000,
          line_amount: 1000000,
        },
      ],
    };

    const target_status = '受注';

    const result = validateDealStatusTransition(current_deal, target_status);

    expect(result).toEqual({
      is_valid: true,
      can_transition: true,
      previous_status: '提案中',
      new_status: '受注',
      transition_timestamp: expect.any(String),
      status_history_record: {
        deal_id: 'DEAL-001',
        from_status: '提案中',
        to_status: '受注',
        transition_reason: expect.any(String),
        transitioned_at: expect.any(String),
      },
    });

    expect(result.is_valid).toBe(true);
    expect(result.can_transition).toBe(true);
    expect(result.new_status).toBe('受注');
    expect(result.status_history_record.from_status).toBe('提案中');
    expect(result.status_history_record.to_status).toBe('受注');
  });
});