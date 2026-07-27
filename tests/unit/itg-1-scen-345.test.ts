import { generateMonthlyBillingReport } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-345
  test('月次決算レポート生成機能 - 請求書ステータスが『発行済』のとき、請求金額として集計される', () => {
    // Arrange: テスト用データベースをセットアップ
    const targetMonthStart = new Date('2024-01-01T00:00:00Z');
    const targetMonthEnd = new Date('2024-01-31T23:59:59Z');

    const invoiceRecords = [
      {
        invoiceId: 'INV-001',
        customerId: 'CUST-001',
        invoiceAmount: 100000,
        status: '発行済',
        invoiceDate: new Date('2024-01-15T00:00:00Z'),
      },
      {
        invoiceId: 'INV-002',
        customerId: 'CUST-001',
        invoiceAmount: 50000,
        status: '下書き',
        invoiceDate: new Date('2024-01-10T00:00:00Z'),
      },
      {
        invoiceId: 'INV-003',
        customerId: 'CUST-001',
        invoiceAmount: 30000,
        status: 'キャンセル',
        invoiceDate: new Date('2024-01-20T00:00:00Z'),
      },
    ];

    // DocumentStorageAdapterをモック化
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'DOC-001',
        url: 'https://example.com/doc-001',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://example.com/share/abc123',
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // NotificationServiceAdapterをモック化
    const mockNotificationServiceAdapter = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        notificationId: 'NOTIF-001',
        status: 'sent',
      }),
      sendQuoteNotification: jest.fn().mockResolvedValue({
        notificationId: 'NOTIF-002',
        status: 'sent',
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        notificationId: 'NOTIF-003',
        status: 'sent',
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        deliveryStatus: 'delivered',
      }),
    };

    // Act: 月次決算レポート生成機能を実行
    const result = generateMonthlyBillingReport(
      {
        invoiceRecords: invoiceRecords,
        periodStart: targetMonthStart,
        periodEnd: targetMonthEnd,
      },
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter
    );

    // Assert: 生成されたレポートから『請求金額集計欄』を確認
    expect(result.totalInvoiceAmount).toBe(100000);
    expect(result.invoiceCountByStatus).toEqual({
      発行済: 1,
      下書き: 0,
      キャンセル: 0,
    });
    expect(result.includedInvoices).toHaveLength(1);
    expect(result.includedInvoices[0].invoiceId).toBe('INV-001');
    expect(result.excludedInvoices).toHaveLength(2);
    expect(result.reportPeriod).toEqual({
      start: targetMonthStart.toISOString(),
      end: targetMonthEnd.toISOString(),
    });
  });
});