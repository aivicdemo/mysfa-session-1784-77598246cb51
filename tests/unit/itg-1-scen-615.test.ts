import {
  issueInvoiceAndUpdateDealStatus,
} from "../../src/logic/it-1-2";

describe("商談ステータスと請求データの紐付け・可視化", () => {
  // SCEN-615: [normal] 請求書自動生成機能 - 請求書発行時、商談レコードの請求ステータスを『請求済み』に更新する
  test("should update deal billing status from pending to invoiced when invoice is issued", async () => {
    // Arrange: テスト用の商談レコード
    const dealRecord = {
      dealId: "deal_001",
      dealName: "テスト商談001",
      customerId: "cust_001",
      customerName: "テスト顧客A",
      amount: 100000,
      stage: "クローズ/受注",
      billingStatus: "未請求",
      invoiceDate: null,
      invoiceNumber: null,
    };

    // DocumentStorageAdapterをモック化
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: "doc_12345",
        url: "https://storage.example.com/doc_12345",
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    // NotificationServiceAdapterをモック化
    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        status: "sent",
        messageId: "msg_001",
      }),
      getDeliveryStatus: jest.fn(),
    };

    // PaymentGatewayAdapterをモック化
    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLinkUrl: "https://payment.example.com/inv_001",
        linkId: "link_001",
        expiresAt: "2024-12-31T23:59:59Z",
      }),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    // Act: 請求書自動生成機能を実行
    const result = await issueInvoiceAndUpdateDealStatus(
      dealRecord,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    // Assert
    // 1. 請求ステータスが『未請求』から『請求済み』に更新されていることを確認
    expect(result.updatedDealStatus.billingStatus).toBe("請求済み");

    // 2. 請求書レコードがシステムに作成されていることを確認
    expect(result.invoiceRecord).toBeDefined();
    expect(result.invoiceRecord.dealId).toBe("deal_001");
    expect(result.invoiceRecord.amount).toBe(100000);
    expect(result.invoiceRecord.customerName).toBe("テスト顧客A");

    // 3. DocumentStorageAdapterのuploadDocumentが1回呼び出されていることを確認
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(1);
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        dealId: "deal_001",
        amount: 100000,
        format: "PDF",
      })
    );

    // 4. NotificationServiceAdapterのsendInvoiceNotificationが1回呼び出されていることを確認
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalledTimes(
      1
    );
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: "cust_001",
        invoiceNumber: expect.any(String),
        amount: 100000,
      })
    );

    // 5. PaymentGatewayAdapterのgeneratePaymentLinkが1回呼び出されていることを確認
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledTimes(1);
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: expect.any(String),
        amount: 100000,
      })
    );

    // 6. 請求書の支払いリンクが正しく設定されていることを確認
    expect(result.invoiceRecord.paymentLinkUrl).toBe(
      "https://payment.example.com/inv_001"
    );

    // 7. invoiceDateが設定されていることを確認
    expect(result.updatedDealStatus.invoiceDate).toBeDefined();
    expect(result.updatedDealStatus.invoiceNumber).toBeDefined();
  });
});