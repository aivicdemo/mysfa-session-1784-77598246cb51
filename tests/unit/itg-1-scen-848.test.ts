import { validateInvoiceForApproval } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  // SCEN-848
  test("請求書承認検証機能 - 請求明細が0件のとき検証が不合格になる", () => {
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

    const invoiceWithEmptyLineItems = {
      invoiceId: "INV-2024-001",
      customerId: "CUST-001",
      customerName: "テスト顧客",
      invoiceDate: "2024-01-15",
      dueDate: "2024-02-15",
      totalAmount: 0,
      lineItems: [],
      status: "pending_approval",
    };

    expect(() =>
      validateInvoiceForApproval(
        invoiceWithEmptyLineItems,
        mockDocumentStorageAdapter,
        mockNotificationServiceAdapter,
        mockPaymentGatewayAdapter
      )
    ).toThrow(/請求明細/);

    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(
      mockNotificationServiceAdapter.sendInvoiceNotification
    ).not.toHaveBeenCalled();
    expect(
      mockPaymentGatewayAdapter.generatePaymentLink
    ).not.toHaveBeenCalled();
  });
});