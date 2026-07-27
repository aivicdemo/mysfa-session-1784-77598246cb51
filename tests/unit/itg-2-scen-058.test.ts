import { issueOrder } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向け専用ポータルでの商談情報参照機能', () => {
  // SCEN-058
  test('帳票発行時の発行日時自動付与と発行履歴記録 - 営業担当者IDが欠けている入力で注文書を発行しようとしたときは例外が発生する', () => {
    // テスト用の営業担当者IDなしの注文書発行リクエストオブジェクトを構築
    const orderRequestWithoutSalesUserId = {
      customerId: 'CUST-001',
      customerName: 'テスト株式会社',
      items: [
        {
          productId: 'PROD-001',
          productName: 'サービスA',
          quantity: 1,
          unitPrice: 100000
        }
      ],
      totalAmount: 100000,
      salesUserId: null, // 営業担当者IDなし
      issueDate: new Date('2024-01-15T10:00:00Z')
    };

    // DocumentStorageAdapterをモック化
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn()
    };

    // NotificationServiceAdapterをモック化
    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn()
    };

    // AuditLogExporterをモック化
    const mockAuditLogExporter = {
      logUserAccess: jest.fn(),
      logDataAccess: jest.fn(),
      logPermissionChange: jest.fn(),
      queryAuditLog: jest.fn()
    };

    // 注文書発行機能を呼び出し、例外が発生することを検証
    expect(() =>
      issueOrder(
        orderRequestWithoutSalesUserId,
        mockDocumentStorageAdapter,
        mockNotificationServiceAdapter,
        mockAuditLogExporter
      )
    ).toThrow(/営業担当者ID/);

    // 外部サービスが呼び出されていないことを確認
    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendOrderNotification).not.toHaveBeenCalled();
    expect(mockAuditLogExporter.logDataAccess).not.toHaveBeenCalled();
  });
});