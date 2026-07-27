import { detectDelayedDeals } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-562
  test('商談ステータスが「受注」で請求書発行日が記録されている場合、遅延案件判定の対象となる', () => {
    const deal = {
      dealId: 'DEAL-562-001',
      dealName: 'テスト商談-562',
      customerId: 'CUST-A-001',
      customerName: 'テスト顧客A',
      amount: 500000,
      status: '受注',
      invoiceIssuedDate: new Date('2024-01-15T10:30:00Z'),
      invoiceNumber: 'INV-2024-001',
      expectedBillingDate: new Date('2024-01-10T00:00:00Z'),
    };

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: 'file-123',
        url: 'https://storage.example.com/file-123',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareUrl: 'https://drive.example.com/share/abc123',
        expiresAt: new Date('2024-01-22T10:30:00Z'),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const result = detectDelayedDeals(
      [deal],
      mockDocumentStorageAdapter,
      new Date('2024-01-15T10:30:00Z')
    );

    expect(result).toEqual({
      delayedDeals: [
        {
          dealId: 'DEAL-562-001',
          dealName: 'テスト商談-562',
          customerId: 'CUST-A-001',
          customerName: 'テスト顧客A',
          amount: 500000,
          status: '受注',
          invoiceIssuedDate: new Date('2024-01-15T10:30:00Z'),
          invoiceNumber: 'INV-2024-001',
          expectedBillingDate: new Date('2024-01-10T00:00:00Z'),
          isDelayed: true,
          delayDays: 5,
          detectionStatus: '遅延判定対象',
        },
      ],
      totalDelayedCount: 1,
      detectionTimestamp: new Date('2024-01-15T10:30:00Z'),
    });

    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
  });
});