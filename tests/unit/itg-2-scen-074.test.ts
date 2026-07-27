import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { issueInvoice } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 商談情報参照機能', () => {
  // SCEN-074: [edge] 帳票発行時の発行日時自動付与と発行履歴記録 - 請求書の発行日時が年をまたぐとき、その日時が正確に記録される
  
  let mockDocumentStorageAdapter: any;
  let mockNotificationServiceAdapter: any;
  let mockPaymentGatewayAdapter: any;
  let mockAuditLogExporter: any;
  let realDateNow: () => number;
  let issuedInvoiceId: string | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    realDateNow = Date.now;

    // Mock DocumentStorageAdapter
    mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'doc-12345',
        shareLink: 'https://drive.google.com/file/d/test-share-link',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://drive.google.com/file/d/test-share-link',
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // Mock NotificationServiceAdapter
    mockNotificationServiceAdapter = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: 'msg-12345',
        status: 'sent',
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: 'delivered',
        openedAt: null,
      }),
    };

    // Mock PaymentGatewayAdapter
    mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLinkId: 'pay-link-12345',
        paymentUrl: 'https://payment.example.com/pay/12345',
        expiresAt: '2025-01-31T23:59:59Z',
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        transactionId: 'txn-12345',
        status: 'completed',
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        status: 'pending',
      }),
    };

    // Mock AuditLogExporter
    mockAuditLogExporter = {
      logDataAccess: jest.fn().mockResolvedValue({ logId: 'audit-12345' }),
      logUserAccess: jest.fn().mockResolvedValue({ logId: 'audit-12346' }),
      logPermissionChange: jest.fn().mockResolvedValue({ logId: 'audit-12347' }),
      queryAuditLog: jest.fn().mockResolvedValue([]),
    };

    // Set system time to 2024-12-31T23:59:50Z
    const fixedTimeBeforeYearChange = new Date('2024-12-31T23:59:50Z').getTime();
    jest.useFakeTimers();
    jest.setSystemTime(fixedTimeBeforeYearChange);
  });

  afterEach(() => {
    jest.useRealTimers();
    Date.now = realDateNow;
  });

  test('should record invoice issued_at with year boundary crossing timestamp and create audit log entry', async () => {
    // Arrange
    const invoiceRequest = {
      customerId: 'cust-001',
      customerName: 'テスト顧客',
      amount: 100000,
      billingPeriod: '2024-12',
      description: 'December 2024 Invoice',
      userId: 'user-001',
      portalSessionId: 'session-xyz789',
    };

    const expectedIssuedAtTimestamp = '2024-12-31T23:59:50Z';
    const expectedIssuedAtIso = new Date('2024-12-31T23:59:50Z');

    // Act
    const result = await issueInvoice(
      invoiceRequest,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter,
      mockAuditLogExporter
    );

    issuedInvoiceId = result.invoiceId;

    // Assert: Verify invoice was created with correct issued_at timestamp
    expect(result).toEqual(
      expect.objectContaining({
        invoiceId: expect.any(String),
        issuedAt: expectedIssuedAtIso.toISOString(),
        status: 'issued',
        customerName: 'テスト顧客',
        amount: 100000,
        billingPeriod: '2024-12',
      })
    );

    // Assert: Verify DocumentStorageAdapter.uploadDocument was called
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: issuedInvoiceId,
        fileName: expect.stringContaining('invoice'),
      })
    );

    // Assert: Verify NotificationServiceAdapter.sendInvoiceNotification was called
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        customerEmail: expect.any(String),
        invoiceId: issuedInvoiceId,
        issuedAt: expectedIssuedAtTimestamp,
      })
    );

    // Assert: Verify PaymentGatewayAdapter.generatePaymentLink was called
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: issuedInvoiceId,
        amount: 100000,
      })
    );

    // Assert: Verify AuditLogExporter.logDataAccess was called with correct timestamp
    expect(mockAuditLogExporter.logDataAccess).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-001',
        operationType: 'invoice_issued',
        resourceId: issuedInvoiceId,
        timestamp: expectedIssuedAtTimestamp,
        sessionId: 'session-xyz789',
      })
    );

    // Assert: Verify issued history record was created with exact timestamp
    expect(result.historyRecord).toEqual(
      expect.objectContaining({
        invoiceId: issuedInvoiceId,
        issuedAt: expectedIssuedAtTimestamp,
        customerName: 'テスト顧客',
        amount: 100000,
        status: 'issued',
      })
    );

    // Assert: Verify the timestamp is exactly 2024-12-31T23:59:50Z (before year change)
    const issuedAtDate = new Date(result.issuedAt);
    expect(issuedAtDate.toISOString()).toBe(expectedIssuedAtTimestamp);
    expect(issuedAtDate.getFullYear()).toBe(2024);
    expect(issuedAtDate.getMonth()).toBe(11); // December is month 11
    expect(issuedAtDate.getDate()).toBe(31);
    expect(issuedAtDate.getHours()).toBe(23);
    expect(issuedAtDate.getMinutes()).toBe(59);
    expect(issuedAtDate.getSeconds()).toBe(50);
  });
});