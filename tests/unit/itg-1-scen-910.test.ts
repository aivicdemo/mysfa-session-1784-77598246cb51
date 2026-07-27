import { validateInvoiceApproval } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  // SCEN-910
  test("請求書承認検証機能 - 注文の金額と請求書の金額が不一致のとき検証が不合格になる", () => {
    const orderId = "ORD-001";
    const customerId = "CUST-001";
    const orderAmount = 100000;
    const invoiceAmount = 95000;
    const invoiceId = "INV-001";

    const invoiceData = {
      invoiceId: invoiceId,
      orderId: orderId,
      customerId: customerId,
      invoiceAmount: invoiceAmount,
      orderAmount: orderAmount,
      lineItems: [
        {
          productId: "PROD-001",
          unitPrice: 10000,
          quantity: 10,
        },
      ],
      approvalStatus: "PENDING",
    };

    const result = validateInvoiceApproval(invoiceData);

    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe("INVOICE_AMOUNT_MISMATCH");
    expect(result.message).toBe(
      "請求書金額（95,000円）が注文金額（100,000円）と一致していません。請求書の承認はできません"
    );
    expect(result.approvalStatus).toBe("REJECTED");
  });
});