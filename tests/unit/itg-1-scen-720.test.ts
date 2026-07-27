import { verifyInvoiceStatusReconciliation } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  test('SCEN-720: ステータス照合ロジック - 請求書発行ステータスが空の場合、照合は実行されない', () => {
    // Arrange: モック化されたアダプターを作成
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

    // 請求書データオブジェクトを作成、発行ステータスをnullで初期化
    const invoiceDataWithNullStatus = {
      invoiceId: 'INV-20240415-001',
      customerId: 'CUST-0012',
      dealId: 'DEAL-20240410-005',
      amount: 150000,
      invoiceStatus: null as string | null,
      issuedDate: '2024-04-15T09:30:00Z',
      invoiceDetails: [
        {
          description: 'サービス提供',
          quantity: 1,
          unitPrice: 150000,
          totalPrice: 150000,
        },
      ],
    };

    // Act: ステータス照合ロジックを実行
    const result = verifyInvoiceStatusReconciliation(
      invoiceDataWithNullStatus,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    // Assert: 照合が実行されていないことを確認
    expect(result).toEqual({
      isReconciliationExecuted: false,
      reason: '発行ステータス',
    });

    // 外部アダプターのメソッドが呼び出されていないことを確認
    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(mockDocumentStorageAdapter.generateShareLink).not.toHaveBeenCalled();
    expect(mockDocumentStorageAdapter.deleteDocument).not.toHaveBeenCalled();

    expect(mockNotificationServiceAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.getDeliveryStatus).not.toHaveBeenCalled();

    expect(mockPaymentGatewayAdapter.verifyPayment).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.getTransactionStatus).not.toHaveBeenCalled();
  });

  test('SCEN-720: ステータス照合ロジック - 請求書発行ステータスが空文字列の場合、照合は実行されない', () => {
    // Arrange: モック化されたアダプターを作成
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

    // 請求書データオブジェクトを作成、発行ステータスを空文字列で初期化
    const invoiceDataWithEmptyStatus = {
      invoiceId: 'INV-20240415-002',
      customerId: 'CUST-0013',
      dealId: 'DEAL-20240410-006',
      amount: 250000,
      invoiceStatus: '',
      issuedDate: '2024-04-15T10:15:00Z',
      invoiceDetails: [
        {
          description: 'コンサルティング費用',
          quantity: 1,
          unitPrice: 250000,
          totalPrice: 250000,
        },
      ],
    };

    // Act: ステータス照合ロジックを実行
    const result = verifyInvoiceStatusReconciliation(
      invoiceDataWithEmptyStatus,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    // Assert: 照合が実行されていないことを確認
    expect(result).toEqual({
      isReconciliationExecuted: false,
      reason: '発行ステータス',
    });

    // 外部アダプターのメソッドが呼び出されていないことを確認
    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.verifyPayment).not.toHaveBeenCalled();
  });
});