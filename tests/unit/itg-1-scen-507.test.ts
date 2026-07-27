import { detectDealInvoiceDiscrepancy } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-507
  test('商談ステータスが「受注」で請求書金額が商談金額より10万円少ないとき、金額ズレが検出される', () => {
    const dealRecord = {
      dealId: 'DEAL-20250115-001',
      customerName: 'テスト顧客A',
      dealStatus: '受注',
      dealAmount: 1000000,
    };

    const invoiceRecord = {
      invoiceId: 'INV-20250115-001',
      dealId: 'DEAL-20250115-001',
      invoiceAmount: 900000,
      invoiceStatus: '発行済',
    };

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({ success: true }),
      generateShareLink: jest.fn().mockResolvedValue({ shareLink: 'https://example.com/share' }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({ success: true }),
      sendOrderNotification: jest.fn().mockResolvedValue({ success: true }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({ success: true }),
      getDeliveryStatus: jest.fn().mockResolvedValue({ status: 'delivered' }),
    };

    const detectionTimestamp = new Date('2025-01-15T14:30:00Z');

    const result = detectDealInvoiceDiscrepancy(
      dealRecord,
      invoiceRecord,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      detectionTimestamp,
    );

    expect(result).toEqual({
      discrepancyStatus: 'ズレあり',
      discrepancyAmount: 100000,
      discrepancyType: '請求書金額不足',
      targetDealId: 'DEAL-20250115-001',
      targetInvoiceId: 'INV-20250115-001',
      detectionDateTime: detectionTimestamp,
    });
  });
});