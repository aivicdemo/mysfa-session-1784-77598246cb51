import { validateInvoiceAmounts } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向け専用ポータル - 商談情報参照機能', () => {
  // SCEN-094
  test('請求書承認検証機能 - 複数明細の合計が請求書合計と一致することを検証する', () => {
    // Arrange
    const invoiceId = 'INV-TEST-001';
    const invoiceTotal = 15000;

    const lineItems = [
      {
        lineItemId: 'LINE-001',
        productName: '商品A',
        quantity: 2,
        unitPrice: 3000,
        subtotal: 6000,
      },
      {
        lineItemId: 'LINE-002',
        productName: '商品B',
        quantity: 3,
        unitPrice: 2000,
        subtotal: 6000,
      },
      {
        lineItemId: 'LINE-003',
        productName: '商品C',
        quantity: 1,
        unitPrice: 3000,
        subtotal: 3000,
      },
    ];

    const invoice = {
      invoiceId: invoiceId,
      totalAmount: invoiceTotal,
      lineItems: lineItems,
    };

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

    // Act
    const validationResult = validateInvoiceAmounts(
      invoice,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter,
      mockIdentityProviderAdapter,
      mockAuditLogExporter,
    );

    // Assert
    expect(validationResult.isValid).toBe(true);
    expect(validationResult.lineItemTotal).toBe(15000);
    expect(validationResult.invoiceTotal).toBe(15000);
    expect(validationResult.amountsMatch).toBe(true);
    expect(validationResult.canApprove).toBe(true);
  });
});