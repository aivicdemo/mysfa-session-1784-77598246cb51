import { validateDealStatusTransition } from '../../src/logic/it-1784969823049-2-1-1';

describe('商談レコードの進捗ステータスと提案内容の入力・保存機能', () => {
  // SCEN-724: [error] 商談ステータス遷移検証機能 - 不正なステータス遷移（スキップ遷移）は拒否される
  test('should reject invalid status transition that skips required intermediate statuses', () => {
    const current_status = 'リード';
    const target_status = '受注';

    expect(() =>
      validateDealStatusTransition({
        current_status,
        target_status,
      })
    ).toThrow(/不正なステータス遷移/);
  });
});