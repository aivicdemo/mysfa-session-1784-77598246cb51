import { updateDealStatusWithProposal } from '../../src/logic/it-1784969823049-2-1-1';

describe('商談レコードの進捗ステータスと提案内容の入力・保存機能', () => {
  // SCEN-175
  test('商談ステータスの変更時に提案内容が同時に入力・保存される', () => {
    const dealRecord = {
      deal_id: 'DEAL-001',
      customer_id: 'CUST-12345',
      customer_name: '株式会社テスト',
      current_status: '初期接触',
      proposal_content: '',
      deal_amount: 500000,
      target_close_date: '2024-02-15',
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-01-10T09:00:00Z',
    };

    const updatePayload = {
      deal_id: 'DEAL-001',
      new_status: '提案中',
      proposal_content: '提案内容テスト：製品A導入',
      updated_by: 'user-001',
      updated_at: '2024-01-15T11:00:00Z',
    };

    const result = updateDealStatusWithProposal(dealRecord, updatePayload);

    expect(result).toEqual({
      deal_id: 'DEAL-001',
      customer_id: 'CUST-12345',
      customer_name: '株式会社テスト',
      current_status: '提案中',
      proposal_content: '提案内容テスト：製品A導入',
      deal_amount: 500000,
      target_close_date: '2024-02-15',
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-01-15T11:00:00Z',
      updated_by: 'user-001',
      is_saved: true,
      save_message: '商談情報を保存しました',
    });

    expect(result.current_status).toBe('提案中');
    expect(result.proposal_content).toBe('提案内容テスト：製品A導入');
    expect(result.is_saved).toBe(true);
  });
});