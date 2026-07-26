import { detectBillingStatusMismatch } from "../../src/logic/it-1784969823049-2-1-3";

describe("顧客ポータルのアクセス制御と権限管理", () => {
  // SCEN-061
  test("ステータス・請求ズレ検出機能 - 請求書発行が商談ステータス更新から1日後の場合、ズレなしと判定される", () => {
    const dealId = "DEAL-001";
    const customerId = "CUST-001";
    const dealAmount = 500000;

    const statusUpdateTime = new Date("2024-01-01T10:00:00Z");
    const invoiceIssuedTime = new Date("2024-01-02T10:00:00Z");

    const dealRecord = {
      dealId,
      customerId,
      dealAmount,
      status: "受注",
      statusUpdatedAt: statusUpdateTime,
    };

    const invoiceRecord = {
      dealId,
      customerId,
      invoiceAmount: dealAmount,
      issuedAt: invoiceIssuedTime,
    };

    const result = detectBillingStatusMismatch({
      deal: dealRecord,
      invoice: invoiceRecord,
    });

    expect(result.hasMismatch).toBe(false);
    expect(result.mismatchFlag).toBe(false);
    expect(result.errorMessage).toBe("");
    expect(result.delayDays).toBe(1);
  });
});