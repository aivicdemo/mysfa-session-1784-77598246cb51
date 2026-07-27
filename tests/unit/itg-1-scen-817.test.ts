import { validateBillingData } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  test("SCEN-817: 請求対象データ妥当性検証機能 - 請求期日が本日のとき、該当データを承認対象と判定する", () => {
    // Arrange: jest のモック日時機能を使用して現在時刻を固定
    const today = new Date("2024-01-15T00:00:00Z");
    jest.useFakeTimers();
    jest.setSystemTime(today);

    const billingData = {
      billing_id: "BILL-001",
      customer_id: "CUST-001",
      billing_amount: 10000,
      billing_due_date: new Date("2024-01-15T00:00:00Z"),
      status: "未処理",
    };

    // Act
    const result = validateBillingData(billingData);

    // Assert
    expect(result.is_approval_required).toBe(true);
    expect(result.validation_status).toBe("APPROVAL_REQUIRED");
    expect(result.processing_category).toBe("ELIGIBLE_FOR_APPROVAL");

    // Cleanup
    jest.useRealTimers();
  });
});