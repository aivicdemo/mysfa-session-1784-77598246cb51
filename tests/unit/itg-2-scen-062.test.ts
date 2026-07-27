import { jest } from '@jest/globals';
import { issueInvoiceWithHistory } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 商談情報参照機能', () => {
  // SCEN-062: [normal] 帳票発行時の発行日時自動付与と発行履歴記録 - 請求書の発行日時が過去の日時のとき、その日時が記録される
  test('should record invoice issued_at field with user-provided past datetime when invoice is issued', async () => {
    // Arrange
    const customerID = 'CUST-001';
    const invoiceID = 'INV-20240115-001';
    const userProvidedIssuedAt = new Date('2024-01-15T14:30:00Z');
    const systemCurrentTimestamp = new Date('2024-06-20T10:00:00Z');

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentID: 'doc-001',
        storagePath: 'invoices/INV-20240115-001.pdf',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://drive.google.com/share/inv-001',
      }),
      deleteDocument: jest.fn().mockResolvedValue(undefined),
    };

    const mockNotificationServiceAdapter = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageID: 'msg-001',
        deliveryStatus: 'sent',
      }),
      sendQuoteNotification: jest.fn().mockResolvedValue(undefined),
      sendOrderNotification: jest.fn().mockResolvedValue(undefined),
      getDeliveryStatus: jest.fn().mockResolvedValue(undefined),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLink: 'https://payment.gateway.com/link-001',
        expiresAt: new Date('2024-01-20T14:30:00Z'),
      }),
      verifyPayment: jest.fn().mockResolvedValue(undefined),
      getTransactionStatus: jest.fn().mockResolvedValue(undefined),
    };

    const mockAuditLogExporter = {
      logUserAccess: jest.fn().mockResolvedValue(undefined),
      logDataAccess: jest.fn().mockResolvedValue(undefined),
      logPermissionChange: jest.fn().mockResolvedValue(undefined),
      queryAuditLog: jest.fn().mockResolvedValue(undefined),
    };

    const invoiceData = {
      invoiceID,
      customerID,
      totalAmount: 150000,
      currency: 'JPY',
      items: [
        {
          itemID: 'item-001',
          description: 'Service A',
          quantity: 1,
          unitPrice: 150000,
          lineAmount: 150000,
        },
      ],
      issuedAt: userProvidedIssuedAt,
    };

    const expectedHistoryRecord = {
      invoiceID,
      customerID,
      issued_at: userProvidedIssuedAt.toISOString(),
      documentStoragePath: 'invoices/INV-20240115-001.pdf',
      paymentLink: 'https://payment.gateway.com/link-001',
      notificationStatus: 'sent',
    };

    const expectedAuditLogCall = {
      operationType: 'INVOICE_ISSUED',
      operationTarget: invoiceID,
      customerID,
      timestamp: systemCurrentTimestamp.toISOString(),
      details: {
        issuedAt: userProvidedIssuedAt.toISOString(),
      },
    };

    // Act
    const result = await issueInvoiceWithHistory(invoiceData, {
      documentStorageAdapter: mockDocumentStorageAdapter,
      notificationServiceAdapter: mockNotificationServiceAdapter,
      paymentGatewayAdapter: mockPaymentGatewayAdapter,
      auditLogExporter: mockAuditLogExporter,
      currentTimestamp: systemCurrentTimestamp,
    });

    // Assert
    expect(result.invoiceID).toBe(invoiceID);
    expect(result.historyRecord.issued_at).toBe('2024-01-15T14:30:00.000Z');
    expect(result.historyRecord.documentStoragePath).toBe(
      'invoices/INV-20240115-001.pdf'
    );
    expect(result.historyRecord.paymentLink).toBe(
      'https://payment.gateway.com/link-001'
    );
    expect(result.historyRecord.notificationStatus).toBe('sent');

    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceID,
        customerID,
      })
    );
    expect(
      mockDocumentStorageAdapter.uploadDocument
    ).toHaveBeenCalledTimes(1);

    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceID,
        customerID,
      })
    );
    expect(
      mockNotificationServiceAdapter.sendInvoiceNotification
    ).toHaveBeenCalledTimes(1);

    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceID,
        totalAmount: 150000,
      })
    );
    expect(
      mockPaymentGatewayAdapter.generatePaymentLink
    ).toHaveBeenCalledTimes(1);

    expect(mockAuditLogExporter.logDataAccess).toHaveBeenCalledWith(
      expect.objectContaining({
        operationType: 'INVOICE_ISSUED',
        operationTarget: invoiceID,
        customerID,
      })
    );
    expect(mockAuditLogExporter.logDataAccess).toHaveBeenCalledTimes(1);
  });
});