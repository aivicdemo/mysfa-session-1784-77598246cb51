import { updateDealStatusToContracted } from '../../src/logic/it-1784969823049-2-1-1';

describe('商談レコードの進捗ステータスと提案内容の入力・保存機能', () => {
  // SCEN-211
  test('商談ステータスを成約に変更する際、必須項目チェックで金額が入力されていない場合にステータス更新が拒否される', () => {
    const dealRecord = {
      id: 'DEAL-001',
      customerId: 'CUST-001',
      status: '提案中',
      amount: null,
      customerName: 'テスト顧客',
      proposalDate: '2024-01-15',
      details: 'テスト商談'
    };

    const result = () => updateDealStatusToContracted(dealRecord);

    expect(result).toThrow(/金額/);
  });
});