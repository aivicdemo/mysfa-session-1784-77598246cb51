import { validateDealStatusTransition } from "../../src/logic/it-1784969823049-2-1-1";

describe("商談レコードの進捗ステータスと提案内容の入力・保存機能", () => {
  test("SCEN-234: 不正なステータス値への遷移がエラーで拒否される", () => {
    const currentStatus = "提案中";
    const invalidNewStatus = "invalid_status";
    const validStatuses = ["初期接触", "提案中", "交渉中", "受注", "失注"];

    expect(() =>
      validateDealStatusTransition({
        currentStatus,
        newStatus: invalidNewStatus,
        validStatuses,
      })
    ).toThrow(/ステータス/);
  });
});