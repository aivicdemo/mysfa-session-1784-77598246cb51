import { validateDealStatusTransition } from '../../src/logic/it-1784969823049-2-1-1';

describe('商談レコードの進捗ステータスと提案内容の入力・保存機能', () => {
  // SCEN-727: [error] 商談ステータス遷移検証機能 - ステータスマスタに存在しない遷移先ステータスは拒否される
  test('ステータスマスタに存在しない遷移先ステータスは拒否される', () => {
    const validStatuses = ['リード', '初期接触', '提案待ち', '見積提出', '交渉中', '受注', '失注'];
    const currentStatus = '初期接触';
    const invalidTargetStatus = 'ペンディング中';
    const dealId = 'DEAL-001';

    const transitionInput = {
      dealId: dealId,
      currentStatus: currentStatus,
      targetStatus: invalidTargetStatus,
      validStatuses: validStatuses,
    };

    expect(() => validateDealStatusTransition(transitionInput)).toThrow(/ステータス/);
  });
});