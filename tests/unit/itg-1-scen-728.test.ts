import { validateDealStatusTransition } from "../../src/logic/it-1784969823049-2-1-1";

describe("商談レコードの進捗ステータスと提案内容の入力・保存機能", () => {
  test("SCEN-728: 遷移元ステータスが空の場合、検証は失敗する", () => {
    const sourceStatus = "";
    const targetStatus = "提案中";

    expect(() =>
      validateDealStatusTransition(sourceStatus, targetStatus)
    ).toThrow(/遷移元ステータス/);
  });
});