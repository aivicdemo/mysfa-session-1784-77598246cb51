import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { issueInvoiceWithFutureDateTime } from '../../src/logic/it-1784969823049-2-1-2';

const fetchMock = require('jest-fetch-mock');

describe('顧客向けポータル商談情報参照機能 - 帳票発行', () => {
  beforeEach(() => {
    fetchMock.enableMocks();
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.disableMocks();
  });

  // SCEN-065
  test('帳票発行時の発行日時自動付与と発行履歴記録 - 請求書の発行日時が未来の日時のとき、その日時が記録される', async () => {
    const authenticatedUserId = 'user-001';
    const futureDateTime = new Date('2025-01-15T15:30:00Z');
    const customerId = 'cust-123';
    const invoiceAmount = 150000;
    const invoiceItems = [
      { itemName: 'consulting service', quantity: 10, unitPrice: 15000 }
    ];

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'doc-456',
        uploadedAt: '2025-01-15T14:30:00Z',
        storageUrl: 'https://storage.example.com/invoices/doc-456.pdf'
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://share.example.com/doc-456',
        expiresAt: '2025-01-22T14:30:00Z'
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true })
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: 'msg-789',
        sentAt: '2025-01-15T14:30:00Z'
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        messageId: 'msg-790',
        sentAt: '2025-01-15T14:30:00Z'
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: 'msg-791',
        sentAt: '2025-01-15T14:30:00Z'
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: 'delivered',
        openedAt: '2025-01-15T14:35:00Z'
      })
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLinkId: 'paylink-222',
        paymentUrl: 'https://payment.example.com/paylink-222',
        expiresAt: '2025-02-15T15:30:00Z'
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        transactionId: 'txn-333',
        status: 'completed',
        paidAt: '2025-01-15T15:30:00Z'
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        transactionId: 'txn-333',
        status: 'completed',
        amount: 150000
      })
    };

    const mockAuditLogExporter = {
      logUserAccess: jest.fn().mockResolvedValue({ logged: true }),
      logDataAccess: jest.fn().mockResolvedValue({ logged: true }),
      logPermissionChange: jest.fn().mockResolvedValue({ logged: true }),
      queryAuditLog: jest.fn().mockResolvedValue({
        logs: [
          {
            eventId: 'evt-001',
            userId: authenticatedUserId,
            operationType: 'invoice_issued',
            timestamp: futureDateTime.toISOString(),
            resourceId: 'inv-567'
          }
        ]
      })
    };

    const result = await issueInvoiceWithFutureDateTime(
      {
        authenticatedUserId,
        customerId,
        invoiceAmount,
        invoiceItems,
        issuedDateTime: futureDateTime
      },
      {
        documentStorageAdapter: mockDocumentStorageAdapter,
        notificationServiceAdapter: mockNotificationServiceAdapter,
        paymentGatewayAdapter: mockPaymentGatewayAdapter,
        auditLogExporter: mockAuditLogExporter
      }
    );

    expect(result.invoiceRecord.issuedDateTime).toEqual(futureDateTime);
    expect(result.invoiceRecord.invoiceId).toBeDefined();
    expect(result.invoiceRecord.status).toBe('issued');

    expect(result.issuanceHistory.userId).toBe(authenticatedUserId);
    expect(result.issuanceHistory.issuedDateTime).toEqual(futureDateTime);
    expect(result.issuanceHistory.invoiceId).toBe(result.invoiceRecord.invoiceId);
    expect(result.issuanceHistory.operationType).toBe('invoice_issued');

    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: result.invoiceRecord.invoiceId
      })
    );

    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId,
        invoiceId: result.invoiceRecord.invoiceId
      })
    );

    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: result.invoiceRecord.invoiceId,
        amount: invoiceAmount
      })
    );

    expect(mockAuditLogExporter.logDataAccess).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: authenticatedUserId,
        operationType: 'invoice_issued',
        timestamp: futureDateTime.toISOString()
      })
    );

    expect(result.auditLogRecorded).toBe(true);
  });
});