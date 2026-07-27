import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import type {
  DealUpdateRequest,
  DealUpdateResponse,
  DocumentStorageAdapter,
  NotificationServiceAdapter,
  PaymentGatewayAdapter,
} from "../../src/logic/it-1784969823049-2-1-1";
import {
  updateDealStatusToContracted,
} from "../../src/logic/it-1784969823049-2-1-1";

describe("商談レコードの進捗ステータスと提案内容の入力・保存機能", () => {
  let mockDocumentStorageAdapter: jest.Mocked<DocumentStorageAdapter>;
  let mockNotificationServiceAdapter: jest.Mocked<NotificationServiceAdapter>;
  let mockPaymentGatewayAdapter: jest.Mocked<PaymentGatewayAdapter>;

  beforeEach(() => {
    mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: "doc_12345",
        url: "https://example.com/docs/doc_12345",
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: "https://example.com/share/token_abc123",
        expiresAt: "2024-02-15T23:59:59Z",
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: "msg_quote_001",
        sentAt: "2024-01-15T11:00:00Z",
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        messageId: "msg_order_001",
        sentAt: "2024-01-15T11:00:00Z",
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: "msg_invoice_001",
        sentAt: "2024-01-15T11:00:00Z",
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: "delivered",
        openedAt: "2024-01-15T12:30:00Z",
      }),
    };

    mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLinkId: "pay_link_001",
        url: "https://payment.example.com/pay/token_xyz789",
        expiresAt: "2024-01-22T23:59:59Z",
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        transactionId: "txn_001",
        status: "completed",
        verifiedAt: "2024-01-15T11:30:00Z",
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        transactionId: "txn_001",
        status: "completed",
        amount: 1234567.89,
      }),
    };
  });

  // SCEN-216
  test("商談ステータスを成約に変更する際、必須項目チェックで商談金額が小数を含む場合にステータス更新が成功する", async () => {
    const dealUpdateRequest: DealUpdateRequest = {
      dealId: "deal_001",
      customerId: "cust_001",
      customerName: "テスト株式会社",
      dealName: "2024年システム導入案件",
      dealAmount: 1234567.89,
      status: "contracted",
      dealDetailLines: [
        {
          lineId: "line_001",
          productId: "prod_001",
          productName: "システム導入サービス",
          quantity: 1,
          unitPrice: 1000000.0,
          lineTotal: 1000000.0,
        },
        {
          lineId: "line_002",
          productId: "prod_002",
          productName: "導入コンサルティング",
          quantity: 1,
          unitPrice: 234567.89,
          lineTotal: 234567.89,
        },
      ],
      userId: "user_001",
    };

    const result: DealUpdateResponse = await updateDealStatusToContracted(
      dealUpdateRequest,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    expect(result.success).toBe(true);
    expect(result.dealId).toBe("deal_001");
    expect(result.status).toBe("contracted");
    expect(result.dealAmount).toBe(1234567.89);
    expect(result.message).toBe("商談を更新しました");

    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalled();

    const uploadCall = mockDocumentStorageAdapter.uploadDocument.mock.calls[0];
    expect(uploadCall).toBeDefined();
    expect(uploadCall[0]).toMatchObject({
      dealId: "deal_001",
      documentType: "invoice",
    });

    const invoiceNotificationCall =
      mockNotificationServiceAdapter.sendInvoiceNotification.mock.calls[0];
    expect(invoiceNotificationCall).toBeDefined();
    expect(invoiceNotificationCall[0]).toMatchObject({
      customerId: "cust_001",
      dealAmount: 1234567.89,
    });

    const paymentLinkCall =
      mockPaymentGatewayAdapter.generatePaymentLink.mock.calls[0];
    expect(paymentLinkCall).toBeDefined();
    expect(paymentLinkCall[0]).toMatchObject({
      dealId: "deal_001",
      amount: 1234567.89,
    });
  });
});