import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import { generateInvoiceWithMonthEndDate } from "../../src/logic/it-1-1";

interface MockDocumentStorageAdapter {
  uploadDocument: jest.Mock;
  generateShareLink: jest.Mock;
  deleteDocument: jest.Mock;
}

interface MockNotificationServiceAdapter {
  sendInvoiceNotification: jest.Mock;
  sendQuoteNotification: jest.Mock;
  sendOrderNotification: jest.Mock;
  getDeliveryStatus: jest.Mock;
}

interface MockPaymentGatewayAdapter {
  generatePaymentLink: jest.Mock;
  verifyPayment: jest.Mock;
  getTransactionStatus: jest.Mock;
}

describe("見積・注文・請求書の自動生成機能", () => {
  let mockDocumentStorageAdapter: MockDocumentStorageAdapter;
  let mockNotificationServiceAdapter: MockNotificationServiceAdapter;
  let mockPaymentGatewayAdapter: MockPaymentGatewayAdapter;

  beforeEach(() => {
    mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: "doc-20240131-001",
        storagePath: "gs://bucket/invoices/2024-01-31/inv-C001.pdf",
        uploadedAt: "2024-01-31T14:30:00Z",
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: "https://drive.google.com/file/d/abc123/view?usp=sharing",
        expiresAt: "2024-02-07T14:30:00Z",
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    mockNotificationServiceAdapter = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        notificationId: "notif-20240131-001",
        status: "sent",
        sentAt: "2024-01-31T14:30:15Z",
      }),
      sendQuoteNotification: jest.fn().mockResolvedValue({ status: "sent" }),
      sendOrderNotification: jest.fn().mockResolvedValue({ status: "sent" }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: "delivered",
        openedAt: null,
      }),
    };

    mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLinkId: "pay-link-20240131-001",
        paymentUrl:
          "https://payment.gmo.jp/link/inv-C001-100000-20240131?token=xyz",
        expiresAt: "2024-02-14T14:30:00Z",
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        transactionId: "txn-20240131-001",
        status: "verified",
        verifiedAt: "2024-01-31T14:30:00Z",
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        transactionId: "txn-20240131-001",
        status: "completed",
      }),
    };

    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-31T14:30:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  // SCEN-617
  test("請求書発行日が月末の場合、請求書に正しい月末日付が記録される", async () => {
    const customerId = "C001";
    const invoiceAmount = 100000;
    const billingPeriod = "2024-01";

    const result = await generateInvoiceWithMonthEndDate(
      {
        customerId,
        invoiceAmount,
        billingPeriod,
      },
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    expect(result.invoiceId).toBeDefined();
    expect(result.invoiceIssueDate).toBe("2024-01-31");

    expect(result.invoiceIssueDate).toMatch(/2024-01-31/);
    expect(result.billingPeriod).toBe("2024-01");
    expect(result.customerId).toBe("C001");
    expect(result.invoiceAmount).toBe(100000);

    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(1);
    const uploadCall = mockDocumentStorageAdapter.uploadDocument.mock
      .calls[0][0];
    expect(uploadCall.invoiceIssueDate).toBe("2024-01-31");
    expect(uploadCall.invoiceIssueDateFormatted).toBe("2024年1月31日");

    expect(result.documentStoragePath).toBe(
      "gs://bucket/invoices/2024-01-31/inv-C001.pdf"
    );

    expect(mockNotificationServiceAdapter.sendInvoiceNotification)
      .toHaveBeenCalledTimes(1);
    const notificationCall =
      mockNotificationServiceAdapter.sendInvoiceNotification.mock.calls[0][0];
    expect(notificationCall.invoiceIssueDate).toBe("2024-01-31");

    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledTimes(
      1
    );

    expect(result.dbSaved).toBe(true);
    expect(result.savedIssueDate).toBe("2024-01-31");
  });
});