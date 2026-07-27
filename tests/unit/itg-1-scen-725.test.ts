import { validateDealStatusTransition } from '../../src/logic/it-1784969823049-2-1-1';

describe('商談ステータスの進捗管理機能', () => {
  // SCEN-725
  test('同一ステータスへの遷移は拒否される', () => {
    const currentStatus = '初期接触';
    const targetStatus = '初期接触';

    expect(() => {
      validateDealStatusTransition({
        currentStatus,
        targetStatus,
      });
    }).toThrow(/ステータス遷移/);
  });
});