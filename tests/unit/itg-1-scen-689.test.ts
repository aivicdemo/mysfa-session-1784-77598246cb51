import { detectUnbilledCases } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-689
  test('月次決算期限3営業日前に照合開始時、商談ステータスが受注完了だが請求書未発行の案件は未請求として検出される', () => {
    const currentDate = new Date('2024-01-12T00:00:00Z');
    const monthlyDeadline = new Date('2024-01-15T23:59:59Z');
    const businessDaysBefore = 3;

    const dealData = {
      dealId: 'DEAL-001',
      customerName: 'テスト顧客A',
      amount: 100000,
      status: '受注完了',
      contractDate: new Date('2024-01-01T00:00:00Z'),
    };

    const invoiceHistoryRecords: Array<{
      dealId: string;
      invoiceId: string;
      issuedDate: Date;
    }> = [];

    const documentStorageAdapterStub = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'doc-123',
        url: 'https://drive.google.com/file/d/mock-id',
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const notificationServiceAdapterStub = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const result = detectUnbilledCases({
      currentDate,
      monthlyDeadline,
      businessDaysBefore,
      dealRecords: [dealData],
      invoiceHistoryRecords,
      documentStorageAdapter: documentStorageAdapterStub,
      notificationServiceAdapter: notificationServiceAdapterStub,
    });

    expect(result.detectedCases).toHaveLength(1);
    expect(result.detectedCases[0]).toEqual({
      dealId: 'DEAL-001',
      customerName: 'テスト顧客A',
      amount: 100000,
      status: '受注完了',
      discrepancyType: '未請求',
      discrepancyReason: '受注完了だが請求書未発行',
      detectedAt: currentDate,
    });

    expect(documentStorageAdapterStub.uploadDocument).not.toHaveBeenCalled();
    expect(notificationServiceAdapterStub.sendInvoiceNotification).not.toHaveBeenCalled();
  });
});