import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import { issueInvoiceWithHistory } from "../../src/logic/it-1784969823049-2-1-2";

const fetchMock = require("jest-fetch-mock");

describe("顧客向けポータル - 商談情報参照機能", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.resetMocks();
  });

  // SCEN-086: [normal] 帳票発行時の発行日時自動付与と発行履歴記録 - 請求書の発行履歴に顧客IDが正確に記録される
  test("請求書発行時に発行日時が自動付与され、顧客IDを含む発行履歴が正確に記録される", async () => {
    const customerId = "CUST-20240115-001";
    const invoiceAmount = 50000;
    const invoicePeriodStart = "2024-01-01";
    const invoicePeriodEnd = "2024-01-31";
    const invoiceSummary = "サービス提供料";
    const issueTimestamp = "2024-01-15T10:30:45Z";
    const documentId = "DOC-20240115-ABC123";
    const notificationStatus = "sent";

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn(async () => ({
        documentId: documentId,
        timestamp: issueTimestamp,
      })),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const mockNotificationServiceAdapter = {
      sendInvoiceNotification: jest.fn(async () => ({
        deliveryStatus: notificationStatus,
      })),
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const mockInvoiceIssueHistoryRepository = {
      save: jest.fn(async (record: any) => record),
      findLatest: jest.fn(async () => ({
        customer_id: customerId,
        issue_datetime: issueTimestamp,
        document_id: documentId,
        notification_status: notificationStatus,
        invoice_amount: invoiceAmount,
        invoice_period_start: invoicePeriodStart,
        invoice_period_end: invoicePeriodEnd,
      })),
    };

    const invoiceData = {
      customerId: customerId,
      amount: invoiceAmount,
      periodStart: invoicePeriodStart,
      periodEnd: invoicePeriodEnd,
      summary: invoiceSummary,
    };

    const result = await issueInvoiceWithHistory(
      invoiceData,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockInvoiceIssueHistoryRepository
    );

    const issuedRecord = await mockInvoiceIssueHistoryRepository.findLatest();

    expect(result.success).toBe(true);
    expect(result.issuedRecord.customer_id).toBe(customerId);
    expect(result.issuedRecord.issue_datetime).toBe(issueTimestamp);
    expect(result.issuedRecord.document_id).toBe(documentId);
    expect(result.issuedRecord.notification_status).toBe(notificationStatus);
    expect(result.issuedRecord.invoice_amount).toBe(invoiceAmount);
    expect(result.issuedRecord.invoice_period_start).toBe(invoicePeriodStart);
    expect(result.issuedRecord.invoice_period_end).toBe(invoicePeriodEnd);

    expect(issuedRecord.customer_id).toBe(customerId);
    expect(issuedRecord.issue_datetime).toBe(issueTimestamp);
    expect(issuedRecord.document_id).toBe(documentId);
    expect(issuedRecord.notification_status).toBe(notificationStatus);
    expect(issuedRecord.invoice_amount).toBe(invoiceAmount);
    expect(issuedRecord.invoice_period_start).toBe(invoicePeriodStart);
    expect(issuedRecord.invoice_period_end).toBe(invoicePeriodEnd);

    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalled();
    expect(
      mockNotificationServiceAdapter.sendInvoiceNotification
    ).toHaveBeenCalled();
    expect(mockInvoiceIssueHistoryRepository.save).toHaveBeenCalled();
  });
});