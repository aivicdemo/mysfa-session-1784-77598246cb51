import { updateDealRecord } from "../../src/logic/it-1784969823049-2-1-1";

describe("商談レコードの進捗ステータスと提案内容の入力・保存機能", () => {
  // SCEN-223
  test("商談レコードが存在しない場合、更新処理がエラーで中止される", () => {
    const nonExistentDealId = "DEAL-999999";
    const updatePayload = {
      dealId: nonExistentDealId,
      progressStatus: "交渉中",
      proposalContent: "提案内容テスト",
    };

    expect(() => updateDealRecord(updatePayload)).toThrow(/指定された商談レコード/);
  });
});