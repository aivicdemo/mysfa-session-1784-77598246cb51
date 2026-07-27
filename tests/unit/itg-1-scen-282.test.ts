import {
  verifyDealAndInvoiceLink,
} from "../../src/logic/it-1784969823049-1-1-1";

const fetchMock = require("jest-fetch-mock");

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-282: [error] 商談ステータスと請求データの紐付け・可視化 - 商談レコードの顧客IDが請求書の顧客IDと一致しないとき、紐付けミスが検出される
  test("商談の顧客IDと請求書の顧客IDが一致しない場合、紐付けミスが検出されエラーメッセージが表示される", async () => {
    fetchMock.enableMocks();
    fetchMock.resetMocks();

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: "doc-123",
        url: "https://storage.example.com/doc-123",
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink:
          "https://drive.example.com/share/abc123?expires=1704067200",
        expiresAt: "2024-01-01T12:00:00Z",
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        status: "sent",
        messageId: "msg-001",
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        status: "sent",
        messageId: "msg-002",
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        status: "sent",
        messageId: "msg-003",
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: "delivered",
        openedAt: "2024-01-01T13:00:00Z",
      }),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLink: "https://payment.example.com/pay/tx-789",
        transactionId: "tx-789",
        expiresAt: "2024-01-08T12:00:00Z",
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        verified: true,
        status: "completed",
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        status: "pending",
        amount: 150000,
        currency: "JPY",
      }),
    };

    const dealRecord = {
      dealId: "DEAL-001",
      customerId: "CUST-001",
      status: "contract",
      amount: 150000,
      currency: "JPY",
      dealDate: "2024-01-01T10:00:00Z",
      items: [
        {
          itemId: "ITEM-001",
          itemName: "Product A",
          quantity: 1,
          unitPrice: 150000,
          subtotal: 150000,
        },
      ],
    };

    const invoiceRecord = {
      invoiceId: "INV-001",
      customerId: "CUST-002",
      dealId: "DEAL-001",
      status: "issued",
      amount: 150000,
      currency: "JPY",
      invoiceDate: "2024-01-01T11:00:00Z",
      items: [
        {
          itemId: "ITEM-001",
          itemName: "Product A",
          quantity: 1,
          unitPrice: 150000,
          subtotal: 150000,
        },
      ],
    };

    const result = await verifyDealAndInvoiceLink(
      dealRecord,
      invoiceRecord,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    expect(result.isLinked).toBe(false);
    expect(result.mismatchDetected).toBe(true);
    expect(result.linkingStatus).toBe("error");
    expect(result.errorMessage).toBe(
      "顧客IDの不一致エラー：商談顧客ID=CUST-001、請求書顧客ID=CUST-002"
    );
    expect(result.mismatchDetails).toEqual({
      dealCustomerId: "CUST-001",
      invoiceCustomerId: "CUST-002",
      dealId: "DEAL-001",
      invoiceId: "INV-001",
      mismatchType: "customer_id_mismatch",
    });
    expect(result.shouldHighlightWarning).toBe(true);
    expect(result.displayMode).toBe("warning");

    fetchMock.disableMocks();
  });
});