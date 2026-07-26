import { saveNegotiationRecord } from '../../src/logic/it-1784969823049-2-1-1';

describe('商談レコードの進捗ステータスと提案内容の入力・保存機能', () => {
  // SCEN-177
  test('提案内容が空文字列の場合、保存処理がエラーで終了する', () => {
    const negotiation_record = {
      negotiation_id: 'NEG-001',
      customer_id: 'CUST-123',
      status: '提案中',
      proposal_content: '',
      created_at: new Date('2024-01-15T10:00:00Z'),
    };

    expect(() => saveNegotiationRecord(negotiation_record)).toThrow(/提案内容/);
  });
});