import {
  validateDealStatusAndInvoiceAlignment,
} from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-152
  test("商談ステータスが『受注』で請求書発行日が売上計上予定日と一致する場合、ズレなしと判定される", () => {
    const dealData = {
      dealId: "DEAL-001",
      dealStatus: "受注",
      plannedRevenueDate: new Date("2024-01-15"),
      dealAmount: 500000,
      customerId: "CUST-001",
      customerName: "テスト顧客",
    };

    const invoiceData = {
      invoiceId: "INV-001",
      dealId: "DEAL-001",
      invoiceIssuedDate: new Date("2024-01-15"),
      invoiceAmount: 500000,
      customerId: "CUST-001",
    };

    const result = validateDealStatusAndInvoiceAlignment(dealData, invoiceData);

    expect(result).toEqual({
      dealId: "DEAL-001",
      dealStatus: "受注",
      plannedRevenueDate: new Date("2024-01-15"),
      invoiceIssuedDate: new Date("2024-01-15"),
      alignmentStatus: "ズレなし",
      hasWarning: false,
      hasError: false,
      delayDays: 0,
      message: "商談ステータスと請求書発行日が一致しています",
    });

    expect(result.alignmentStatus).toBe("ズレなし");
    expect(result.hasWarning).toBe(false);
    expect(result.hasError).toBe(false);
    expect(result.delayDays).toBe(0);
  });
});