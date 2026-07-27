import { validateInvoiceForApproval } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 請求書承認検証機能', () => {
  // SCEN-130: [normal] 請求書承認検証機能 - 同じ入力で検証を2回実行したとき、同じ結果が返される
  test('同じ請求書データで2回検証実行時に同一の結果が返される', () => {
    // スタブ定義
    const documentStorageStub = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: 'FILE-123',
        url: 'https://example.com/file-123',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://share.example.com/file-123',
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const notificationServiceStub = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: 'MSG-001',
        status: 'sent',
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        messageId: 'MSG-002',
        status: 'sent',
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: 'MSG-003',
        status: 'sent',
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: 'delivered',
        openedAt: '2024-01-15T12:30:00Z',
      }),
    };

    const paymentGatewayStub = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLink: 'https://payment.example.com/pay-123',
        expiresAt: '2024-02-15T11:00:00Z',
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        verified: true,
        transactionId: 'TXN-001',
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        status: 'completed',
        amount: 110000,
      }),
    };

    const identityProviderStub = {
      authenticateUser: jest.fn().mockResolvedValue({
        token: 'token-abc123',
        expiresIn: 3600,
      }),
      validateToken: jest.fn().mockResolvedValue({
        valid: true,
        userId: 'USER-001',
      }),
      refreshToken: jest.fn().mockResolvedValue({
        newToken: 'token-xyz789',
      }),
      revokeSession: jest.fn().mockResolvedValue({
        revoked: true,
      }),
    };

    const auditLogExporterStub = {
      logUserAccess: jest.fn().mockResolvedValue({
        logId: 'LOG-001',
        recorded: true,
      }),
      logDataAccess: jest.fn().mockResolvedValue({
        logId: 'LOG-002',
        recorded: true,
      }),
      logPermissionChange: jest.fn().mockResolvedValue({
        logId: 'LOG-003',
        recorded: true,
      }),
      queryAuditLog: jest.fn().mockResolvedValue({
        logs: [],
        totalCount: 0,
      }),
    };

    // 検証対象の請求書データ
    const invoiceData = {
      invoiceId: 'INV-2024-001',
      customerId: 'CUST-001',
      amount: 100000,
      taxRate: 0.1,
      itemCount: 3,
      items: [
        { itemId: 'ITEM-001', description: 'Product A', quantity: 1, unitPrice: 40000 },
        { itemId: 'ITEM-002', description: 'Product B', quantity: 1, unitPrice: 35000 },
        { itemId: 'ITEM-003', description: 'Product C', quantity: 1, unitPrice: 25000 },
      ],
      issueDate: '2024-01-15T11:00:00Z',
      dueDate: '2024-02-15T11:00:00Z',
      customerName: 'Test Customer Corp',
      customerEmail: 'customer@example.com',
    };

    // 1回目の検証実行
    const firstResult = validateInvoiceForApproval(
      invoiceData,
      documentStorageStub,
      notificationServiceStub,
      paymentGatewayStub,
      identityProviderStub,
      auditLogExporterStub
    );

    // 1回目のスタブ呼び出し回数を記録
    const firstDocumentStorageCallCount = documentStorageStub.uploadDocument.mock.calls.length;
    const firstNotificationCallCount = notificationServiceStub.sendInvoiceNotification.mock.calls.length;
    const firstPaymentGatewayCallCount = paymentGatewayStub.generatePaymentLink.mock.calls.length;
    const firstAuditLogCallCount = auditLogExporterStub.logDataAccess.mock.calls.length;

    // 1回目の検証結果を記録
    const firstStatus = firstResult.validationStatus;
    const firstErrorCode = firstResult.errorCode;
    const firstChecks = firstResult.checksResult;
    const firstTaxAmount = firstResult.taxAmount;
    const firstTotalAmount = firstResult.totalAmount;

    // スタブをリセット
    documentStorageStub.uploadDocument.mockClear();
    notificationServiceStub.sendInvoiceNotification.mockClear();
    paymentGatewayStub.generatePaymentLink.mockClear();
    auditLogExporterStub.logDataAccess.mockClear();

    // 2回目の検証実行
    const secondResult = validateInvoiceForApproval(
      invoiceData,
      documentStorageStub,
      notificationServiceStub,
      paymentGatewayStub,
      identityProviderStub,
      auditLogExporterStub
    );

    // 2回目のスタブ呼び出し回数を記録
    const secondDocumentStorageCallCount = documentStorageStub.uploadDocument.mock.calls.length;
    const secondNotificationCallCount = notificationServiceStub.sendInvoiceNotification.mock.calls.length;
    const secondPaymentGatewayCallCount = paymentGatewayStub.generatePaymentLink.mock.calls.length;
    const secondAuditLogCallCount = auditLogExporterStub.logDataAccess.mock.calls.length;

    // 2回目の検証結果を記録
    const secondStatus = secondResult.validationStatus;
    const secondErrorCode = secondResult.errorCode;
    const secondChecks = secondResult.checksResult;
    const secondTaxAmount = secondResult.taxAmount;
    const secondTotalAmount = secondResult.totalAmount;

    // 検証結果の一致を確認
    expect(firstStatus).toBe(secondStatus);
    expect(firstErrorCode).toBe(secondErrorCode);
    expect(firstChecks).toEqual(secondChecks);
    expect(firstTaxAmount).toBe(secondTaxAmount);
    expect(firstTaxAmount).toBe(10000);
    expect(firstTotalAmount).toBe(secondTotalAmount);
    expect(firstTotalAmount).toBe(110000);

    // スタブ呼び出し回数の一致を確認
    expect(firstDocumentStorageCallCount).toBe(secondDocumentStorageCallCount);
    expect(firstNotificationCallCount).toBe(secondNotificationCallCount);
    expect(firstPaymentGatewayCallCount).toBe(secondPaymentGatewayCallCount);
    expect(firstAuditLogCallCount).toBe(secondAuditLogCallCount);
  });
});