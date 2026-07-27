import {
  fetchDealWithInvoiceInfo,
} from "../../src/logic/it-1-2";

describe("商談ステータスと請求データの紐付け・可視化", () => {
  test("SCEN-667: 商談ステータスが『受注』で紐付く請求書が0件のとき、請求書なしと示される", async () => {
    // テストデータセットアップ
    const customerId = "CUST_001";
    const customerName = "テスト顧客A";
    const dealId = "DEAL_667_001";
    const dealStatus = "受注";
    const dealAmount = 100000;

    // スタブ: DocumentStorageAdapter
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: "FILE_001",
        url: "https://storage.example.com/doc/FILE_001",
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: "https://share.example.com/FILE_001",
        expiresAt: new Date("2024-12-31T23:59:59Z"),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // スタブ: NotificationServiceAdapter
    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: "MSG_QT_001",
        sentAt: new Date("2024-01-15T10:00:00Z"),
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        messageId: "MSG_ORD_001",
        sentAt: new Date("2024-01-15T10:05:00Z"),
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: "MSG_INV_001",
        sentAt: new Date("2024-01-15T10:10:00Z"),
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: "delivered",
        openedAt: new Date("2024-01-15T10:15:00Z"),
      }),
    };

    // スタブ: PaymentGatewayAdapter
    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLinkId: "PAYLINK_667_001",
        paymentUrl: "https://payment.example.com/pay/PAYLINK_667_001",
        expiresAt: new Date("2024-01-22T23:59:59Z"),
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        transactionId: "TXN_001",
        status: "pending",
        verifiedAt: null,
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        transactionId: "TXN_001",
        status: "pending",
        amount: 100000,
      }),
    };

    // 商談詳細データ: ステータス『受注』、請求書なし
    const dealDetailResult = await fetchDealWithInvoiceInfo(
      dealId,
      {
        documentStorageAdapter: mockDocumentStorageAdapter,
        notificationServiceAdapter: mockNotificationServiceAdapter,
        paymentGatewayAdapter: mockPaymentGatewayAdapter,
      }
    );

    // 期待値: 商談ステータスが『受注』、紐付く請求書が0件
    expect(dealDetailResult).toEqual({
      dealId: dealId,
      customerId: customerId,
      customerName: customerName,
      status: dealStatus,
      amount: dealAmount,
      invoiceCount: 0,
      invoices: [],
      invoiceStatusDisplay: "請求書なし",
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });

    // 追加検証: 請求書一覧が空配列
    expect(dealDetailResult.invoices).toEqual([]);
    expect(dealDetailResult.invoiceCount).toBe(0);
    expect(dealDetailResult.invoiceStatusDisplay).toBe("請求書なし");
  });
});