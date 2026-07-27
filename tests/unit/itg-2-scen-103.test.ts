import { describe, test, expect, beforeEach } from '@jest/globals';
import { validateInvoiceForApproval } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向け専用ポータルでの商談情報参照機能', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-103
  test('[error] 請求書承認検証機能 - 請求書明細の金額が0のとき、検証エラーが発生する', () => {
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn(),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    const mockIdentityProviderAdapter = {
      authenticateUser: jest.fn(),
      validateToken: jest.fn(),
      refreshToken: jest.fn(),
      revokeSession: jest.fn(),
    };

    const mockAuditLogExporter = {
      logUserAccess: jest.fn(),
      logDataAccess: jest.fn(),
      logPermissionChange: jest.fn(),
      queryAuditLog: jest.fn(),
    };

    const invoiceData = {
      invoiceNumber: 'INV-TEST-001',
      customerName: 'テスト顧客',
      invoiceDate: '2024-01-15',
      details: [
        {
          itemName: 'テスト品目',
          quantity: 1,
          unitPrice: 0,
          amount: 0,
        },
      ],
      subtotal: 0,
      tax: 0,
      total: 0,
      status: '承認保留中',
    };

    expect(() =>
      validateInvoiceForApproval(
        invoiceData,
        mockDocumentStorageAdapter,
        mockNotificationServiceAdapter,
        mockPaymentGatewayAdapter,
        mockIdentityProviderAdapter,
        mockAuditLogExporter
      )
    ).toThrow(/金額が0/);
  });
});