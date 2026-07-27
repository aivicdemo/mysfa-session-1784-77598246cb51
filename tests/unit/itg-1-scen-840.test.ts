import { validateInvoiceData } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  // SCEN-840
  test("請求対象データ妥当性検証機能 - 必須項目が全て揃い、金額が整合し、重複がない請求データのとき、承認可と判定する", () => {
    const customerId = "CUST-001";
    const invoiceDate = "2024-04-15";
    const paymentDueDate = "2024-05-15";
    const invoicePeriodStart = "2024-04-01";
    const invoicePeriodEnd = "2024-04-30";
    const productAmount = 100000;
    const taxRate = 0.1;
    const taxAmount = productAmount * taxRate;
    const totalAmount = productAmount + taxAmount;

    const invoiceData = {
      customerId: customerId,
      invoiceDate: invoiceDate,
      paymentDueDate: paymentDueDate,
      invoicePeriodStart: invoicePeriodStart,
      invoicePeriodEnd: invoicePeriodEnd,
      productAmount: productAmount,
      taxAmount: taxAmount,
      totalAmount: totalAmount,
    };

    const existingInvoices: typeof invoiceData[] = [];

    const result = validateInvoiceData(invoiceData, existingInvoices);

    expect(result.validationStatus).toBe("承認可");
    expect(result.errorMessage).toBeNull();
    expect(result.validationDetails).toContain("必須項目チェック：OK");
    expect(result.validationDetails).toContain("金額整合性チェック：OK");
    expect(result.validationDetails).toContain("重複チェック：OK");
    expect(result.canProceedToApprovalFlow).toBe(true);
  });
});