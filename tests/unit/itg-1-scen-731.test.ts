import { validateStatusTransition } from '../../src/logic/it-1784969823049-2-1-1';

describe('商談レコードの進捗ステータスと提案内容の入力・保存機能', () => {
  // SCEN-731
  test('[error] 商談ステータス遷移検証機能 - 遷移元ステータスが商談ステータスマスタに未定義の場合、検証は失敗する', () => {
    const validStatuses = ['初期接触', '提案中', '交渉中', '受注', '失注'];
    const sourceStatus = '未定義ステータス';
    const targetStatus = '交渉中';

    expect(() =>
      validateStatusTransition(sourceStatus, targetStatus, validStatuses)
    ).toThrow(/遷移元ステータス/);
  });
});