import { validateInvoiceForApproval } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  // SCEN-875: [error] 請求書承認検証機能 - 請求明細の単価が 0 のとき検証が不合格になる
  test("should reject invoice approval when invoice line item unit price is zero", () => {
    const invoiceData = {
      invoiceId: "INV-20240115-001",
      customerId: "CUST-001",
      customerName: "テスト企業",
      invoiceDate: new Date("2024-01-15T11:00:00Z"),
      dueDate: new Date("2024-02-15T11:00:00Z"),
      totalAmount: 0,
      taxAmount: 0,
      lineItems: [
        {
          lineItemId: "LINE-001",
          productName: "テスト商品",
          quantity: 1,
          unitPrice: 0,
          taxRate: 0.1,
          subtotal: 0,
          taxSubtotal: 0,
          lineTotal: 0,
        },
      ],
    };

    const result = validateInvoiceForApproval(invoiceData);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        code: "INVOICE_UNITPRICE_ZERO_NOT_ALLOWED",
        message: expect.stringMatching(/単価は0より大きい値である必要があります/),
      })
    );
  });
});