import { generateMonthlySettlementReport } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-337
  test('月次決算レポート生成機能 - 商談レコード配列が空のとき、売上実績0・請求金額0・未請求額0でレポートが生成される', async () => {
    const emptyDealRecords = [];

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'doc_001',
        uploadedAt: '2024-04-30T23:59:59Z',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://drive.example.com/share/doc_001',
        expiresAt: '2024-05-07T23:59:59Z',
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        notificationId: 'notif_001',
        deliveryStatus: 'sent',
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        notificationId: 'notif_002',
        deliveryStatus: 'sent',
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        notificationId: 'notif_003',
        deliveryStatus: 'sent',
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: 'delivered',
        openedAt: '2024-04-30T12:00:00Z',
      }),
    };

    const settlementPeriod = {
      startDate: '2024-04-01',
      endDate: '2024-04-30',
    };

    const report = await generateMonthlySettlementReport(
      emptyDealRecords,
      settlementPeriod,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter
    );

    expect(report.salesRevenue).toBe(0);
    expect(report.invoicedAmount).toBe(0);
    expect(report.uninvoicedAmount).toBe(0);

    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalled();
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        contentType: 'application/pdf',
      })
    );
  });
});