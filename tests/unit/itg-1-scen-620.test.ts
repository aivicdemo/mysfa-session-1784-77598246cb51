import {
  generateInvoiceWithPeriod,
} from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  // SCEN-620
  test("請求期間の開始日と終了日が同日の場合、請求書が正しく生成される", () => {
    // Arrange
    const startDate = new Date("2024-01-15T00:00:00Z");
    const endDate = new Date("2024-01-15T23:59:59Z");
    const invoiceAmount = 10000;
    const taxRate = 0.1;
    const taxAmount = 1000;
    const totalAmount = 11000;
    const customerId = "CUST-A";
    const customerEmail = "customer.a@example.com";
    const customerName = "顧客A";

    // Mock adapters
    const mockDocumentStorage = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: "DOC-001",
        url: "https://storage.example.com/DOC-001.pdf",
        uploadedAt: "2024-01-15T10:00:00Z",
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const mockNotificationService = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: "MSG-001",
        status: "sent",
        sentAt: "2024-01-15T10:00:01Z",
      }),
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const mockPaymentGateway = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLinkId: "LINK-001",
        paymentUrl: "https://payment.example.com/pay/LINK-001",
        expiresAt: "2024-02-14T23:59:59Z",
      }),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    const invoiceInput = {
      startDate,
      endDate,
      customerId,
      customerName,
      customerEmail,
      invoiceAmount,
      taxRate,
      documentStorageAdapter: mockDocumentStorage,
      notificationServiceAdapter: mockNotificationService,
      paymentGatewayAdapter: mockPaymentGateway,
    };

    // Act
    const result = generateInvoiceWithPeriod(invoiceInput);

    // Assert
    // (1) 請求期間が「2024年1月15日～2024年1月15日」と表示される
    expect(result.billingPeriod.startDate).toEqual(
      new Date("2024-01-15T00:00:00Z")
    );
    expect(result.billingPeriod.endDate).toEqual(
      new Date("2024-01-15T23:59:59Z")
    );

    // (2) 請求金額が10,000円、税金が1,000円、合計が11,000円と計算される
    expect(result.invoiceAmount).toBe(10000);
    expect(result.taxAmount).toBe(1000);
    expect(result.totalAmount).toBe(11000);

    // (3) 請求書ステータスが「生成完了」に更新される
    expect(result.status).toBe("生成完了");

    // (4) DocumentStorageAdapter.uploadDocument が1回呼び出され、PDF生成に成功する
    expect(mockDocumentStorage.uploadDocument).toHaveBeenCalledTimes(1);
    expect(mockDocumentStorage.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        documentName: expect.stringContaining("請求書"),
        fileFormat: "pdf",
      })
    );
    expect(result.documentId).toBe("DOC-001");

    // (5) NotificationServiceAdapter.sendInvoiceNotification が顧客Aのメールアドレスへ1回呼び出される
    expect(mockNotificationService.sendInvoiceNotification).toHaveBeenCalledTimes(
      1
    );
    expect(
      mockNotificationService.sendInvoiceNotification
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientEmail: customerEmail,
        invoiceId: expect.any(String),
      })
    );

    // (6) PaymentGatewayAdapter.generatePaymentLink が1回呼び出され、支払いリンクが請求書に紐付けられる
    expect(mockPaymentGateway.generatePaymentLink).toHaveBeenCalledTimes(1);
    expect(mockPaymentGateway.generatePaymentLink).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceAmount: 11000,
        customerId,
      })
    );
    expect(result.paymentLinkId).toBe("LINK-001");
    expect(result.paymentUrl).toBe("https://payment.example.com/pay/LINK-001");
  });
});