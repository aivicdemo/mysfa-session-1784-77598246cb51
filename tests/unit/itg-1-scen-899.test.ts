import { validateInvoiceForApproval } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  // SCEN-899
  test("請求書明細の説明文が空白のみのとき検証が不合格になる", () => {
    const invoiceData = {
      invoiceId: "INV-2024-001",
      customerId: "CUST-123",
      customerName: "テスト顧客",
      totalAmount: 100000,
      issueDate: new Date("2024-01-15T11:00:00Z"),
      dueDate: new Date("2024-02-15T11:00:00Z"),
      lineItems: [
        {
          lineId: "LINE-001",
          description: "   ",
          quantity: 1,
          unitPrice: 100000,
          amount: 100000,
        },
      ],
    };

    expect(() => validateInvoiceForApproval(invoiceData)).toThrow(
      /説明文/
    );
  });
});