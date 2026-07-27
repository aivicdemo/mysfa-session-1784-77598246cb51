import { extractBillingTargetData } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  // SCEN-781
  test("請求対象データ抽出機能 - 金額下限が負数のとき、エラーが発生する", () => {
    const invalidParams = {
      amountLowerLimit: -1000,
      amountUpperLimit: 100000,
      startDate: "2024-01-01",
      endDate: "2024-01-31",
      status: "受注",
    };

    expect(() => extractBillingTargetData(invalidParams)).toThrow(
      /金額下限/
    );
  });
});