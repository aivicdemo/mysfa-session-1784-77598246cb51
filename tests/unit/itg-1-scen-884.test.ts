import { approveInvoiceWithValidation } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-884
  test('請求書の割引率が100%に近い場合でも計算が正確である', () => {
    // テストデータ: 割引率99.99%、単価10,000円、数量1
    const invoiceData99_99 = {
      invoiceId: 'INV-99991',
      customerId: 'CUST-001',
      items: [
        {
          productId: 'PROD-001',
          description: 'Test Product',
          unitPrice: 10000,
          quantity: 1,
        },
      ],
      discountRate: 0.9999,
      status: 'pending_approval',
    };

    // 割引前合計: 10,000円
    // 割引後合計: 10,000 * (1 - 0.9999) = 10,000 * 0.0001 = 1.0円
    // 期待値: 1.00円（小数点以下2桁で正確）
    const documentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'DOC-99991',
        shareLink: 'https://storage.example.com/doc-99991',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://storage.example.com/doc-99991',
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const notificationServiceAdapter = {
      sendInvoiceNotification: jest
        .fn()
        .mockResolvedValue({ notificationId: 'NOTIF-99991', sent: true }),
      getDeliveryStatus: jest
        .fn()
        .mockResolvedValue({ status: 'delivered', openedAt: null }),
    };

    const paymentGatewayAdapter = {
      generatePaymentLink: jest
        .fn()
        .mockResolvedValue({ paymentLink: 'https://payment.example.com/99991' }),
      verifyPayment: jest
        .fn()
        .mockResolvedValue({ verified: false, transactionId: null }),
      getTransactionStatus: jest
        .fn()
        .mockResolvedValue({ status: 'pending', amount: 1.0 }),
    };

    const result99_99 = approveInvoiceWithValidation(invoiceData99_99, {
      documentStorageAdapter,
      notificationServiceAdapter,
      paymentGatewayAdapter,
    });

    expect(result99_99.totalAmount).toBe(1.0);
    expect(result99_99.status).toBe('approved');
    expect(documentStorageAdapter.uploadDocument).toHaveBeenCalled();
    expect(notificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalled();
    expect(paymentGatewayAdapter.generatePaymentLink).toHaveBeenCalled();

    // テストデータ: 割引率99.999%、単価10,000円、数量1
    const invoiceData99_999 = {
      invoiceId: 'INV-99992',
      customerId: 'CUST-002',
      items: [
        {
          productId: 'PROD-001',
          description: 'Test Product',
          unitPrice: 10000,
          quantity: 1,
        },
      ],
      discountRate: 0.99999,
      status: 'pending_approval',
    };

    // 割引前合計: 10,000円
    // 割引後合計: 10,000 * (1 - 0.99999) = 10,000 * 0.00001 = 0.1円
    // 期待値: 0.10円（小数点以下2桁で正確）
    documentStorageAdapter.uploadDocument.mockClear();
    notificationServiceAdapter.sendInvoiceNotification.mockClear();
    paymentGatewayAdapter.generatePaymentLink.mockClear();

    const result99_999 = approveInvoiceWithValidation(invoiceData99_999, {
      documentStorageAdapter,
      notificationServiceAdapter,
      paymentGatewayAdapter,
    });

    expect(result99_999.totalAmount).toBe(0.1);
    expect(result99_999.status).toBe('approved');
    expect(documentStorageAdapter.uploadDocument).toHaveBeenCalled();
    expect(notificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalled();
    expect(paymentGatewayAdapter.generatePaymentLink).toHaveBeenCalled();

    // テストデータ: 割引率99.9999%、単価10,000円、数量1
    const invoiceData99_9999 = {
      invoiceId: 'INV-99993',
      customerId: 'CUST-003',
      items: [
        {
          productId: 'PROD-001',
          description: 'Test Product',
          unitPrice: 10000,
          quantity: 1,
        },
      ],
      discountRate: 0.999999,
      status: 'pending_approval',
    };

    // 割引前合計: 10,000円
    // 割引後合計: 10,000 * (1 - 0.999999) = 10,000 * 0.000001 = 0.01円
    // 期待値: 0.01円（小数点以下2桁で正確）
    documentStorageAdapter.uploadDocument.mockClear();
    notificationServiceAdapter.sendInvoiceNotification.mockClear();
    paymentGatewayAdapter.generatePaymentLink.mockClear();

    const result99_9999 = approveInvoiceWithValidation(invoiceData99_9999, {
      documentStorageAdapter,
      notificationServiceAdapter,
      paymentGatewayAdapter,
    });

    expect(result99_9999.totalAmount).toBe(0.01);
    expect(result99_9999.status).toBe('approved');
    expect(documentStorageAdapter.uploadDocument).toHaveBeenCalled();
    expect(notificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalled();
    expect(paymentGatewayAdapter.generatePaymentLink).toHaveBeenCalled();

    // ステータス遷移検証: 「承認待ち」→「承認済み」
    expect(result99_99.previousStatus).toBe('pending_approval');
    expect(result99_99.status).toBe('approved');
    expect(result99_999.previousStatus).toBe('pending_approval');
    expect(result99_999.status).toBe('approved');
    expect(result99_9999.previousStatus).toBe('pending_approval');
    expect(result99_9999.status).toBe('approved');
  });
});