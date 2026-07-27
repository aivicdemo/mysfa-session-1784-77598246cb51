import { validateInvoiceApproval } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  test("SCEN-862: 請求書承認検証機能 - 顧客の住所が欠落しているとき検証が不合格になる", () => {
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: "doc-123",
        url: "https://storage.example.com/doc-123",
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: "https://share.example.com/abc123",
      }),
      deleteDocument: jest.fn().mockResolvedValue(true),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        status: "sent",
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        status: "sent",
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        status: "sent",
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        delivered: true,
      }),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLinkId: "pl-456",
        paymentUrl: "https://payment.example.com/pl-456",
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        verified: true,
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        status: "completed",
      }),
    };

    const invoiceDataWithMissingAddress = {
      invoiceId: "INV-2024-001",
      customerId: "CUST-789",
      customerName: "株式会社テスト",
      customerEmail: "customer@example.com",
      customerAddress: "",
      invoiceAmount: 150000,
      invoiceLineItems: [
        {
          itemId: "ITEM-001",
          itemName: "サービス提供料",
          quantity: 1,
          unitPrice: 150000,
          totalPrice: 150000,
        },
      ],
      invoiceDate: new Date("2024-01-15T10:00:00Z"),
      dueDate: new Date("2024-02-15T10:00:00Z"),
      dealId: "DEAL-555",
      dealStatus: "closed_won",
    };

    const result = validateInvoiceApproval(
      invoiceDataWithMissingAddress,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe("VALIDATION_ERROR_MISSING_CUSTOMER_ADDRESS");
    expect(result.errorMessage).toContain("顧客の住所が入力されていません");

    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(
      mockNotificationServiceAdapter.sendInvoiceNotification
    ).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).not.toHaveBeenCalled();
  });
});