import { validateInvoiceApproval } from '../../src/logic/it-1784969823049-2-1-2';

describe('請求書承認検証機能', () => {
  // SCEN-098
  test('発行日が空のとき、検証エラーが発生する', () => {
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

    const invoiceWithNullIssuedDate = {
      invoiceNumber: 'INV-2024-001',
      customerId: 'CUST-12345',
      amount: 150000,
      billingPeriodStart: '2024-01-01',
      billingPeriodEnd: '2024-01-31',
      issuedDate: null,
    };

    expect(() =>
      validateInvoiceApproval(
        invoiceWithNullIssuedDate,
        mockDocumentStorageAdapter,
        mockNotificationServiceAdapter,
        mockPaymentGatewayAdapter,
        mockIdentityProviderAdapter,
        mockAuditLogExporter
      )
    ).toThrow(/発行日/);
  });
});