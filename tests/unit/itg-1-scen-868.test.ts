import {
  validateInvoiceApproval,
} from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  test("SCEN-868: [edge] 請求書承認検証機能 - 請求書の支払期限が発行日と同日のとき検証が合格する", () => {
    // Arrange: モック化した外部サービスアダプターを準備
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: "doc-12345",
        storageUrl: "https://drive.example.com/files/doc-12345",
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: "https://drive.example.com/share/abc123xyz",
        expiresAt: "2024-01-22T23:59:59Z",
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: "msg-001",
        sentAt: "2024-01-15T10:00:00Z",
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        messageId: "msg-002",
        sentAt: "2024-01-15T10:00:00Z",
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: "msg-003",
        sentAt: "2024-01-15T10:00:00Z",
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: "delivered",
        openedAt: "2024-01-15T10:30:00Z",
      }),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLinkId: "pay-link-001",
        paymentUrl: "https://payment.example.com/pay/xyz789",
        expiresAt: "2024-02-14T23:59:59Z",
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        transactionId: "txn-12345",
        status: "completed",
        verifiedAt: "2024-01-20T14:30:00Z",
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        transactionId: "txn-12345",
        status: "pending",
        createdAt: "2024-01-15T10:00:00Z",
      }),
    };

    // 請求書データを構築：発行日と支払期限が同日
    const invoiceData = {
      invoiceId: "INV-2024-001",
      customerId: "CUST-001",
      customerName: "テスト顧客株式会社",
      customerEmail: "contact@test-customer.jp",
      issuedDate: "2024-01-15",
      dueDate: "2024-01-15",
      totalAmount: 500000,
      taxAmount: 50000,
      invoiceAmount: 550000,
      currency: "JPY",
      dealId: "DEAL-2024-001",
      dealAmount: 550000,
      dealStatus: "completed",
      lineItems: [
        {
          itemId: "ITEM-001",
          description: "コンサルティングサービス",
          quantity: 10,
          unitPrice: 50000,
          amount: 500000,
        },
      ],
      paymentMethod: "bank_transfer",
      notes: "請求書発行テスト",
    };

    // Act: 承認検証機能を実行
    const validationResult = validateInvoiceApproval(
      invoiceData,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    // Assert: 検証結果が「合格（PASSED）」であることを確認
    expect(validationResult.status).toBe("PASSED");
    expect(validationResult.isApproved).toBe(true);
    expect(validationResult.errors).toEqual([]);
    expect(validationResult.warnings).toEqual([]);
    expect(validationResult.validatedAt).toBeDefined();
    expect(typeof validationResult.validatedAt).toBe("string");

    // 支払期限が発行日と同日である場合のロジック検証
    expect(validationResult.daysUntilDue).toBe(0);

    // 外部サービスが呼び出されないことを確認（検証段階では呼び出し不要）
    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).not.toHaveBeenCalled();
  });
});