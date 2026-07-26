import { validateDealStatusTransition } from '../../src/logic/it-1784969823049-2-1-1';

describe('商談レコードの進捗ステータスと提案内容の入力・保存機能', () => {
  // SCEN-195: [error] 商談ステータス遷移の業務ルール検証機能 - 不正なステータス遷移（例：受注→提案中への後戻り）が拒否される
  test('受注から提案中への後戻り遷移は業務ルール違反として拒否される', () => {
    const current_status = '受注';
    const target_status = '提案中';

    expect(() => {
      validateDealStatusTransition({
        current_status,
        target_status,
      });
    }).toThrow(/ステータス遷移/);
  });
});