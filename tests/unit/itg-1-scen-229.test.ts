import { updateDealStatusToConclusion } from '../../src/logic/it-1784969823049-2-1-1';

describe('商談レコードの進捗ステータスと提案内容の入力・保存機能', () => {
  // SCEN-229
  test('商談ステータスを成約に変更する際、必須項目チェックで商談提案内容が欠けている場合にステータス更新が拒否される', () => {
    const dealData = {
      dealId: 'DEAL-001',
      currentStatus: '提案中',
      customerName: '顧客A',
      amount: 1000000,
      proposalContent: null,
    };

    expect(() => updateDealStatusToConclusion(dealData)).toThrow(/提案内容/);
  });
});