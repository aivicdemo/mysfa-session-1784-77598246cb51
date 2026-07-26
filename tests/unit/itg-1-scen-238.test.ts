import { describe, test, expect } from "@jest/globals";
import { determineBillingExecutionTiming } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  // SCEN-238
  test("請求実行タイミング判定機能 - 請求タイプが未定義の商談レコードに対してエラーが返される", () => {
    const dealRecordWithUndefinedBillingType = {
      dealId: "DEAL-2024-001",
      dealName: "A社との商談",
      customerId: "CUST-001",
      customerName: "A社",
      amount: 500000,
      billingType: undefined,
      billingScheduledDate: new Date("2024-02-28T00:00:00Z"),
    };

    expect(() =>
      determineBillingExecutionTiming(dealRecordWithUndefinedBillingType)
    ).toThrow(/請求タイプ/);
  });
});