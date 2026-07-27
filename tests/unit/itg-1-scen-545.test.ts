import { detectUnbilledAndDelayedDeals } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-545
  test("対象となる商談が1件のとき正しく『未請求案件』リストに含まれる", () => {
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: "doc-001",
        url: "https://storage.example.com/doc-001",
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: "https://storage.example.com/share/doc-001",
        expiresAt: "2024-12-31T23:59:59Z",
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: "msg-001",
        status: "sent",
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        messageId: "msg-002",
        status: "sent",
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: "msg-003",
        status: "sent",
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: "delivered",
        openedAt: null,
      }),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLinkId: "link-001",
        paymentUrl: "https://payment.example.com/pay/link-001",
        expiresAt: "2024-12-31T23:59:59Z",
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        transactionId: "txn-001",
        status: "completed",
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        transactionId: "txn-001",
        status: "pending",
        amount: 100000,
      }),
    };

    const dealRecords = [
      {
        dealId: "DEAL-001",
        status: "成約",
        amount: 100000,
        customerName: "テスト顧客A",
        createdAt: "2024-01-15T10:00:00Z",
      },
    ];

    const invoiceRecords = [];

    const result = detectUnbilledAndDelayedDeals(
      dealRecords,
      invoiceRecords,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    expect(result.unbilledDeals).toHaveLength(1);
    expect(result.unbilledDeals[0]).toEqual({
      dealId: "DEAL-001",
      status: "成約",
      amount: 100000,
      customerName: "テスト顧客A",
      createdAt: "2024-01-15T10:00:00Z",
    });
    expect(result.delayedDeals).toHaveLength(0);
  });
});