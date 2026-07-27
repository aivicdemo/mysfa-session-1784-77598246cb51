import { validateInvoiceApproval } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-855
  test("請求書に紐付く商談のステータスが不一致の場合、承認フラグが立たない", () => {
    const dealId = "D001";
    const invoiceId = "I001";
    const customerId = "CUST_A";
    const invoiceAmount = 100000;
    const taxAmount = 10000;
    const dealStatus = "交渉中";
    const approvableStatuses = ["成約", "発注済み"];

    const invoice = {
      invoiceId: invoiceId,
      dealId: dealId,
      customerId: customerId,
      amount: invoiceAmount,
      tax: taxAmount,
      approvalFlag: false,
      approvalStatus: "承認待ち",
    };

    const deal = {
      dealId: dealId,
      status: dealStatus,
      customerId: customerId,
    };

    const result = validateInvoiceApproval(
      invoice,
      deal,
      approvableStatuses
    );

    expect(result.approvalFlag).toBe(false);
    expect(result.errorMessage).toMatch(/紐付く商談のステータス/);
    expect(result.approvalStatus).toBe("承認待ち");
  });
});