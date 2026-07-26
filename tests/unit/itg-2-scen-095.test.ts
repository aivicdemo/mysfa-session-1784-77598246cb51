import { determineBillingExecutionTiming } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル - 請求実行タイミング判定機能", () => {
  // SCEN-095
  test("営業管理システムに存在しない商談レコードの場合、処理がスキップされエラー通知される", () => {
    const nonExistentDealId = "DEAL-999999999";
    const billingType = "monthly";
    const executionPayload = {
      dealId: nonExistentDealId,
      billingType: billingType,
      executionDate: new Date("2024-01-15T10:00:00Z"),
    };

    expect(() =>
      determineBillingExecutionTiming(executionPayload)
    ).toThrow(/商談レコード/);
  });
});