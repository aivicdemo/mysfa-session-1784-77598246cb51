import { validateInvoice } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  // SCEN-869
  test("請求書の支払期限が発行日より前のとき検証が不合格になる", () => {
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn(),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    const invoiceData = {
      invoice_id: "INV-2024-001",
      customer_id: "CUST-123",
      customer_name: "テスト顧客",
      issued_date: new Date("2024-01-15T00:00:00Z"),
      payment_due_date: new Date("2024-01-10T00:00:00Z"),
      total_amount: 100000,
      invoice_lines: [
        {
          line_id: "LINE-001",
          product_name: "商品A",
          quantity: 1,
          unit_price: 100000,
          line_total: 100000,
        },
      ],
      status: "DRAFT",
      customer_email: "customer@example.com",
    };

    const result = validateInvoice(
      invoiceData,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    expect(result.validation_status).toBe("FAILED");
    expect(result.error_code).toMatch(/INVALID_PAYMENT_DUE_DATE/);
    expect(result.error_message).toMatch(/支払期限は発行日以降である必要があります/);
    expect(invoiceData.status).toBe("DRAFT");
    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).not.toHaveBeenCalled();
  });
});