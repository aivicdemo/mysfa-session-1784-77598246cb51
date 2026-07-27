import { validateDealAndInvoiceAlignment } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-736
  test('商談ステータスが「提案中」で請求書が発行されている場合、照合ズレが検出される', () => {
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        document_id: 'doc-12345',
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        status: 'success',
      }),
      getDeliveryStatus: jest.fn(),
    };

    const dealRecord = {
      dealId: 'DEAL-001',
      customerId: 'CUST-001',
      customerName: 'テスト太郎',
      dealStatus: '提案中',
      dealAmount: 100000,
      dealCreatedDate: '2024-01-15T10:00:00Z',
    };

    const invoiceRecord = {
      invoiceId: 'INV-001',
      customerId: 'CUST-001',
      customerName: 'テスト太郎',
      invoiceAmount: 100000,
      invoiceStatus: '発行済み',
      invoiceIssuedDate: '2024-01-15T10:00:00Z',
    };

    const result = validateDealAndInvoiceAlignment(
      dealRecord,
      invoiceRecord,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter
    );

    expect(result.isDiscrepancyDetected).toBe(true);
    expect(result.discrepancyType).toBe('STATUS_MISMATCH');
    expect(result.detailMessage).toBe(
      '商談ステータス「提案中」で請求書が発行されています。商談ステータスを確認してください。'
    );
    expect(result.affectedRecords).toEqual([
      {
        dealId: 'DEAL-001',
        invoiceId: 'INV-001',
        dealStatus: '提案中',
        invoiceStatus: '発行済み',
      },
    ]);
  });
});