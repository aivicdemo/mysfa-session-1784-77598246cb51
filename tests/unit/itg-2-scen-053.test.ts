import { issueBillWithAudit } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータルでの商談情報参照機能', () => {
  // SCEN-053
  test('[error] 帳票発行時の発行日時自動付与と発行履歴記録 - 帳票IDが欠けている入力で請求書を発行しようとしたときは例外が発生する', () => {
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

    const mockAuditLogExporter = {
      logUserAccess: jest.fn(),
      logDataAccess: jest.fn(),
      logPermissionChange: jest.fn(),
      queryAuditLog: jest.fn(),
    };

    const invoiceInput = {
      documentId: '',
      customerId: 'CUST001',
      customerName: '株式会社テスト',
      amount: 150000,
      issueDate: new Date('2024-01-15T11:00:00Z'),
      dueDate: new Date('2024-02-15T23:59:59Z'),
      items: [
        {
          description: 'サービス提供',
          quantity: 1,
          unitPrice: 150000,
        },
      ],
    };

    expect(() =>
      issueBillWithAudit(
        invoiceInput,
        mockDocumentStorageAdapter,
        mockNotificationServiceAdapter,
        mockPaymentGatewayAdapter,
        mockAuditLogExporter
      )
    ).toThrow(/帳票ID/);

    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).not.toHaveBeenCalled();
    expect(mockAuditLogExporter.logDataAccess).not.toHaveBeenCalled();
  });
});