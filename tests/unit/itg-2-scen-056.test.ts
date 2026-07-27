import { issueInvoice } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向け専用ポータルでの商談情報参照機能', () => {
  // SCEN-056
  test('帳票発行時の発行日時自動付与と発行履歴記録 - 顧客IDが欠けている入力で請求書を発行しようとしたときは例外が発生する', () => {
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
      customerId: null,
      invoiceAmount: 150000,
      invoiceContent: 'ソフトウェアライセンス 12ヶ月分',
      invoiceDestination: '株式会社テスト',
      invoiceDueDate: '2024-02-28',
      issuedBy: 'sales_user_001',
    };

    expect(() =>
      issueInvoice(
        invoiceInput,
        mockDocumentStorageAdapter,
        mockNotificationServiceAdapter,
        mockPaymentGatewayAdapter,
        mockAuditLogExporter,
      ),
    ).toThrow(/顧客ID/);

    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).not.toHaveBeenCalled();
    expect(mockAuditLogExporter.logDataAccess).not.toHaveBeenCalled();
  });
});