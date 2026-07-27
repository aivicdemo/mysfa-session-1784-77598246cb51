import {
  verifyDealStatusAndBillingDataBinding,
} from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求データの紐付け・可視化", () => {
  // SCEN-287
  test("商談ステータスが『受注』に更新された商談が0件のとき、処理が0件として正常に完了する", () => {
    // Arrange
    const mockDocumentStorage = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: "doc_123",
        url: "https://example.com/doc",
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: "https://share.example.com/link",
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockNotificationService = {
      sendQuoteNotification: jest.fn().mockResolvedValue({ success: true }),
      sendOrderNotification: jest.fn().mockResolvedValue({ success: true }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({ success: true }),
      getDeliveryStatus: jest.fn().mockResolvedValue({ delivered: true }),
    };

    const mockPaymentGateway = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLink: "https://payment.example.com/link",
        paymentId: "pay_123",
      }),
      verifyPayment: jest.fn().mockResolvedValue({ verified: true }),
      getTransactionStatus: jest.fn().mockResolvedValue({ status: "completed" }),
    };

    const emptyDeals = [];

    const executionTimestamp = new Date("2024-04-15T10:30:00Z");

    // Act
    const result = verifyDealStatusAndBillingDataBinding(
      emptyDeals,
      mockDocumentStorage,
      mockNotificationService,
      mockPaymentGateway,
      executionTimestamp
    );

    // Assert
    expect(result.processedCount).toBe(0);
    expect(result.message).toContain("紐付け対象件数：0件");
    expect(result.completionStatus).toBe("completed");
    expect(result.executionTime).toEqual(executionTimestamp);

    expect(mockDocumentStorage.uploadDocument).toHaveBeenCalledTimes(0);
    expect(mockNotificationService.sendInvoiceNotification).toHaveBeenCalledTimes(
      0
    );
    expect(mockPaymentGateway.generatePaymentLink).toHaveBeenCalledTimes(0);

    expect(result.errorLogs).toHaveLength(0);
  });
});