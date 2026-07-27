import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { issueInvoice } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向け専用ポータルでの商談情報参照機能', () => {
  let mockDocumentStorageAdapter: any;
  let mockNotificationServiceAdapter: any;
  let mockPaymentGatewayAdapter: any;
  let mockAuditLogExporter: any;

  beforeEach(() => {
    mockDocumentStorageAdapter = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn(),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    mockAuditLogExporter = {
      logUserAccess: jest.fn(),
      logDataAccess: jest.fn(),
      logPermissionChange: jest.fn(),
      queryAuditLog: jest.fn(),
    };
  });

  // SCEN-059
  test('帳票発行時の発行日時自動付与と発行履歴記録 - 営業担当者IDが欠けている入力で請求書を発行しようとしたときは例外が発生する', () => {
    const invoiceRequestWithoutSalesPersonId = {
      customerId: 'CUST-001',
      invoiceAmount: 100000,
      invoiceDate: '2024-01-15T10:00:00Z',
      dueDate: '2024-02-15T23:59:59Z',
      invoiceNumber: 'INV-2024-001',
      salesPersonId: null,
      items: [
        {
          description: 'Product A',
          quantity: 10,
          unitPrice: 10000,
        },
      ],
    };

    expect(() =>
      issueInvoice(
        invoiceRequestWithoutSalesPersonId,
        mockDocumentStorageAdapter,
        mockNotificationServiceAdapter,
        mockPaymentGatewayAdapter,
        mockAuditLogExporter,
      ),
    ).toThrow(/営業担当者ID/);

    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(
      mockNotificationServiceAdapter.sendInvoiceNotification,
    ).not.toHaveBeenCalled();
    expect(
      mockPaymentGatewayAdapter.generatePaymentLink,
    ).not.toHaveBeenCalled();
    expect(mockAuditLogExporter.logDataAccess).not.toHaveBeenCalled();
  });
});