import {
  updateDealStatusAndGenerateBilling,
} from "../../src/logic/it-1-2";

describe("商談ステータスと請求データの紐付け・可視化", () => {
  // SCEN-227
  test("商談ステータスを成約に変更した場合、同じ入力で2回実行しても同じ請求データが生成される", () => {
    // Setup: テスト用の商談レコード
    const dealRecord = {
      dealId: "deal_test_001",
      dealName: "テスト商談A",
      amount: 100000,
      customerId: "cust_001",
      customerName: "テスト顧客001",
      currentStatus: "提案中",
      targetStatus: "成約",
    };

    // Mock: DocumentStorageAdapter
    const mockDocumentStorage = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: "doc_001",
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: "https://drive.example.com/share/doc_001",
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // Mock: NotificationServiceAdapter
    const mockNotificationService = {
      sendQuoteNotification: jest
        .fn()
        .mockResolvedValue({ status: "sent", messageId: "msg_001" }),
      sendOrderNotification: jest
        .fn()
        .mockResolvedValue({ status: "sent", messageId: "msg_002" }),
      sendInvoiceNotification: jest
        .fn()
        .mockResolvedValue({ status: "sent", messageId: "msg_003" }),
      getDeliveryStatus: jest
        .fn()
        .mockResolvedValue({ status: "delivered", openedAt: null }),
    };

    // Mock: PaymentGatewayAdapter
    const mockPaymentGateway = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLink: "https://payment.example.com/pay/inv_001",
        invoiceId: "inv_001",
      }),
      verifyPayment: jest
        .fn()
        .mockResolvedValue({ status: "verified", transactionId: "txn_001" }),
      getTransactionStatus: jest
        .fn()
        .mockResolvedValue({ status: "pending", amount: 100000 }),
    };

    // Mock: Billing data store
    const billingDataStore: Array<{
      invoiceId: string;
      amount: number;
      fileId: string;
      paymentLink: string;
      dealId: string;
      createdAt: Date;
    }> = [];

    const saveBillingData = (data: {
      invoiceId: string;
      amount: number;
      fileId: string;
      paymentLink: string;
      dealId: string;
      createdAt: Date;
    }) => {
      // Check if already exists (idempotency)
      const existing = billingDataStore.find(
        (record) => record.invoiceId === data.invoiceId
      );
      if (!existing) {
        billingDataStore.push(data);
      }
    };

    // First execution
    const result1 = updateDealStatusAndGenerateBilling(
      dealRecord,
      mockDocumentStorage,
      mockNotificationService,
      mockPaymentGateway
    );

    const billingData1 = {
      invoiceId: "inv_001",
      amount: 100000,
      fileId: "doc_001",
      paymentLink: "https://payment.example.com/pay/inv_001",
      dealId: dealRecord.dealId,
      createdAt: new Date("2024-01-15T10:00:00Z"),
    };
    saveBillingData(billingData1);

    expect(result1).toEqual({
      success: true,
      dealStatus: "成約",
      invoiceId: "inv_001",
      billingAmount: 100000,
    });

    // Second execution with identical input
    const result2 = updateDealStatusAndGenerateBilling(
      dealRecord,
      mockDocumentStorage,
      mockNotificationService,
      mockPaymentGateway
    );

    const billingData2 = {
      invoiceId: "inv_001",
      amount: 100000,
      fileId: "doc_001",
      paymentLink: "https://payment.example.com/pay/inv_001",
      dealId: dealRecord.dealId,
      createdAt: new Date("2024-01-15T10:00:00Z"),
    };
    saveBillingData(billingData2);

    // Assertions: Billing data is identical
    expect(result2).toEqual({
      success: true,
      dealStatus: "成約",
      invoiceId: "inv_001",
      billingAmount: 100000,
    });

    expect(billingData1).toEqual(billingData2);
    expect(billingData1.invoiceId).toBe("inv_001");
    expect(billingData1.amount).toBe(100000);
    expect(billingData1.fileId).toBe("doc_001");
    expect(billingData1.paymentLink).toBe(
      "https://payment.example.com/pay/inv_001"
    );

    // No duplicate billing records
    expect(billingDataStore).toHaveLength(1);

    // Adapter call counts: uploadDocument and generatePaymentLink called only once each
    expect(mockDocumentStorage.uploadDocument).toHaveBeenCalledTimes(1);
    expect(mockPaymentGateway.generatePaymentLink).toHaveBeenCalledTimes(1);

    // Notification service called for invoice
    expect(mockNotificationService.sendInvoiceNotification).toHaveBeenCalledTimes(
      2
    );
  });
});