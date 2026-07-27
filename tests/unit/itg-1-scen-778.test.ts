import { extractBillingTargetData } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  test("SCEN-778: 請求対象データ抽出機能 - 金額上限条件が空のとき、エラーが発生する", () => {
    const extraction_condition = {
      target_period_start: "2024-04-01",
      target_period_end: "2024-04-30",
      amount_lower_bound: 10000,
      amount_upper_bound: null,
      customer_id: "CUST001",
    };

    expect(() => extractBillingTargetData(extraction_condition)).toThrow(
      /金額上限条件/
    );
  });
});