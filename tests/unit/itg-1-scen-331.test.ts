import { generateMonthlySettlementReport } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-331
  test('[normal] 月次決算レポート生成機能 - 商談レコードが作成日時の昇順で並んでいるとき、集計結果に順序が影響しない', async () => {
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: 'doc-001',
        shareLink: 'https://drive.google.com/file/d/doc-001/view',
      }),
      generateShareLink: jest.fn().mockResolvedValue('https://drive.google.com/file/d/doc-001/view'),
      deleteDocument: jest.fn().mockResolvedValue(true),
    };

    const dealRecordsAscending = [
      {
        dealId: 'DEAL-001',
        customerId: 'CUST-001',
        amount: 1000000,
        createdAt: new Date('2024-01-01T09:00:00Z'),
        status: 'completed',
      },
      {
        dealId: 'DEAL-002',
        customerId: 'CUST-002',
        amount: 2000000,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        status: 'completed',
      },
      {
        dealId: 'DEAL-003',
        customerId: 'CUST-003',
        amount: 3000000,
        createdAt: new Date('2024-01-01T11:00:00Z'),
        status: 'completed',
      },
    ];

    const dealRecordsDescending = [
      {
        dealId: 'DEAL-003',
        customerId: 'CUST-003',
        amount: 3000000,
        createdAt: new Date('2024-01-01T11:00:00Z'),
        status: 'completed',
      },
      {
        dealId: 'DEAL-002',
        customerId: 'CUST-002',
        amount: 2000000,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        status: 'completed',
      },
      {
        dealId: 'DEAL-001',
        customerId: 'CUST-001',
        amount: 1000000,
        createdAt: new Date('2024-01-01T09:00:00Z'),
        status: 'completed',
      },
    ];

    const periodStart = new Date('2024-01-01T00:00:00Z');
    const periodEnd = new Date('2024-01-31T23:59:59Z');

    const reportAscending = await generateMonthlySettlementReport(
      dealRecordsAscending,
      periodStart,
      periodEnd,
      mockDocumentStorageAdapter
    );

    const reportDescending = await generateMonthlySettlementReport(
      dealRecordsDescending,
      periodStart,
      periodEnd,
      mockDocumentStorageAdapter
    );

    expect(reportAscending.summary.totalAmount).toBe(6000000);
    expect(reportAscending.summary.dealCount).toBe(3);
    expect(reportAscending.summary.averageAmount).toBe(2000000);

    expect(reportDescending.summary.totalAmount).toBe(6000000);
    expect(reportDescending.summary.dealCount).toBe(3);
    expect(reportDescending.summary.averageAmount).toBe(2000000);

    expect(reportAscending.summary.totalAmount).toEqual(reportDescending.summary.totalAmount);
    expect(reportAscending.summary.dealCount).toEqual(reportDescending.summary.dealCount);
    expect(reportAscending.summary.averageAmount).toEqual(reportDescending.summary.averageAmount);

    expect(reportAscending.details.length).toBe(3);
    expect(reportDescending.details.length).toBe(3);

    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(2);
  });
});