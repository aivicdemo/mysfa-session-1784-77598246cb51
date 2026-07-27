import { validateDealStatusTransition } from '../../src/logic/it-1784969823049-2-1-1';

describe('商談ステータス遷移検証機能', () => {
  // SCEN-732
  test('遷移先ステータスが商談ステータスマスタに未定義の場合、検証は失敗する', () => {
    const validStatuses = ['新規', '提案中', '交渉中', '受注', '失注'];
    const currentStatus = '提案中';
    const targetStatus = '保留中';

    expect(() => {
      validateDealStatusTransition({
        currentStatus,
        targetStatus,
        validStatuses,
      });
    }).toThrow(/保留中/);
  });
});