import { describe, it, expect, beforeEach } from '@jest/globals';
import { updateDealStatusToContracted } from '../../src/logic/it-1784969823049-2-1-1';

describe('商談レコードの進捗ステータスと提案内容の入力・保存機能', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-176
  it('提案内容が未入力のまま商談ステータスを『成約』に更新した場合、エラーが返される', () => {
    const deal_record = {
      deal_id: 'DEAL-20240115-001',
      customer_id: 'CUST-ABC-001',
      deal_name: 'テスト商談',
      deal_status: '提案中',
      proposal_content: '',
      deal_amount: 500000,
      expected_close_date: '2024-02-29',
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-01-15T11:00:00Z'
    };

    const new_status = '成約';

    expect(() => {
      updateDealStatusToContracted({
        deal_record,
        new_status
      });
    }).toThrow(/提案内容/);
  });
});