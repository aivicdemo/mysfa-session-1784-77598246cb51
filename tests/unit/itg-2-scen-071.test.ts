import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { issueInvoiceWithAudit } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 商談情報参照機能', () => {
  // SCEN-071: [edge] 帳票発行時の発行日時自動付与と発行履歴記録 - 請求書の発行日時が月初のとき、その日時が正確に記録される
  test('should record invoice issue timestamp accurately at month start (2024-04-01 00:00:00 JST)', async () => {
    // Setup: Fixed system time at 2024-04-01 00:00:00 JST
    const fixedIssuedAt = new Date('2024-04-01T00:00:00+09:00');
    const fixedIssuedAtISO = '2024-04-01T00:00:00.000Z';
    const fixedIssuedAtJST = '2024-04-01 00:00:00';

    // Mock DocumentStorageAdapter
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'doc-20240401-001',
        fileUrl: 'https://example.storage.googleapis.com/invoices/2024-04-01/doc-001.pdf',
        uploadedAt: fixedIssuedAtISO,
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://example.storage.googleapis.com/share/link-abc123',
        expiresAt: new Date(fixedIssuedAt.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // Mock NotificationServiceAdapter
    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({ messageId: 'msg-quote-001', sentAt: fixedIssuedAtISO }),
      sendOrderNotification: jest.fn().mockResolvedValue({ messageId: 'msg-order-001', sentAt: fixedIssuedAtISO }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({ messageId: 'msg-invoice-001', sentAt: fixedIssuedAtISO }),
      getDeliveryStatus: jest.fn().mockResolvedValue({ delivered: true, openedAt: fixedIssuedAtISO }),
    };

    // Mock PaymentGatewayAdapter
    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLinkId: 'payment-link-20240401-001',
        paymentUrl: 'https://payment.gmo.jp/payment/link-xyz789',
        generatedAt: fixedIssuedAtISO,
      }),
      verifyPayment: jest.fn().mockResolvedValue({ verified: true, verifiedAt: fixedIssuedAtISO }),
      getTransactionStatus: jest.fn().mockResolvedValue({ status: 'pending', createdAt: fixedIssuedAtISO }),
    };

    // Mock AuditLogExporter
    const mockAuditLogExporter = {
      logUserAccess: jest.fn().mockResolvedValue({ logId: 'log-access-001', recordedAt: fixedIssuedAtISO }),
      logDataAccess: jest.fn().mockResolvedValue({ logId: 'log-data-access-001', recordedAt: fixedIssuedAtISO }),
      logPermissionChange: jest.fn().mockResolvedValue({ logId: 'log-perm-001', recordedAt: fixedIssuedAtISO }),
      queryAuditLog: jest.fn().mockResolvedValue({ logs: [], queriedAt: fixedIssuedAtISO }),
    };

    // Prepare invoice input data
    const invoiceInput = {
      invoiceId: 'INV-20240401-0001',
      customerId: 'CUST-12345',
      customerEmail: 'customer@example.com',
      amount: 100000,
      currency: 'JPY',
      dueDate: new Date('2024-05-01T00:00:00+09:00').toISOString(),
      items: [
        {
          itemId: 'ITEM-001',
          description: 'Product A',
          quantity: 10,
          unitPrice: 10000,
          total: 100000,
        },
      ],
      issuedByUserId: 'USR-admin-001',
      issuedByUserEmail: 'admin@example.com',
    };

    // Execute: Issue invoice with all mocked adapters
    const result = await issueInvoiceWithAudit(
      invoiceInput,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter,
      mockAuditLogExporter,
      fixedIssuedAt // Pass fixed system time
    );

    // Assert: Verify invoice issue history record
    expect(result.invoiceHistoryRecord).toBeDefined();
    expect(result.invoiceHistoryRecord.invoiceId).toBe('INV-20240401-0001');

    // Assert: Verify issued timestamp field matches exactly at month start
    // Expected: 2024-04-01 00:00:00 (JST representation, milliseconds 000)
    expect(result.invoiceHistoryRecord.issuedAt).toBe(fixedIssuedAtISO);
    expect(result.invoiceHistoryRecord.issuedAtFormatted).toBe(fixedIssuedAtJST);

    // Assert: Verify PDF generation timestamp in logs
    expect(mockAuditLogExporter.logDataAccess).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'USR-admin-001',
        operationType: 'INVOICE_ISSUE',
        timestamp: fixedIssuedAtISO,
      })
    );

    const logCall = mockAuditLogExporter.logDataAccess.mock.calls[0][0];
    expect(logCall.timestamp).toBe(fixedIssuedAtISO);

    // Assert: Verify DocumentStorageAdapter was called with upload
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: 'INV-20240401-0001',
        generatedAt: fixedIssuedAtISO,
      })
    );

    // Assert: Verify NotificationServiceAdapter was called to send invoice notification
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: 'INV-20240401-0001',
        customerEmail: 'customer@example.com',
        sentAt: fixedIssuedAtISO,
      })
    );

    // Assert: Verify PaymentGatewayAdapter was called to generate payment link
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: 'INV-20240401-0001',
        amount: 100000,
        generatedAt: fixedIssuedAtISO,
      })
    );

    // Assert: Verify the issued history contains all expected fields
    expect(result.invoiceHistoryRecord.status).toBe('ISSUED');
    expect(result.invoiceHistoryRecord.amount).toBe(100000);
    expect(result.invoiceHistoryRecord.customerId).toBe('CUST-12345');
    expect(result.invoiceHistoryRecord.pdfUrl).toBe('https://example.storage.googleapis.com/invoices/2024-04-01/doc-001.pdf');
    expect(result.invoiceHistoryRecord.paymentLink).toBe('https://payment.gmo.jp/payment/link-xyz789');
    expect(result.invoiceHistoryRecord.notificationSent).toBe(true);

    // Assert: Verify consistency between document upload timestamp and invoice issued timestamp
    const uploadedAt = result.invoiceHistoryRecord.documentUploadedAt;
    expect(uploadedAt).toBe(fixedIssuedAtISO);

    // Assert: Verify month-start edge case handling (no date drift at 00:00:00)
    const issuedDate = new Date(result.invoiceHistoryRecord.issuedAt);
    expect(issuedDate.getUTCFullYear()).toBe(2024);
    expect(issuedDate.getUTCMonth()).toBe(3); // April = month 3 (0-indexed)
    expect(issuedDate.getUTCDate()).toBe(1);
    expect(issuedDate.getUTCHours()).toBe(0);
    expect(issuedDate.getUTCMinutes()).toBe(0);
    expect(issuedDate.getUTCSeconds()).toBe(0);
    expect(issuedDate.getUTCMilliseconds()).toBe(0);
  });
});