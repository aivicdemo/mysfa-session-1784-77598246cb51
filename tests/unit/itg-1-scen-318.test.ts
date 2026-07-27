import { generateMonthlyRevenueReport } from '../../src/logic/it-1-3';
import type { DocumentStorageAdapter } from '../../src/adapters/DocumentStorageAdapter';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-318: [edge] 月次決算レポート生成機能 - 対象期間の終了日23:59:59時点のレコードが集計対象に含まれる
  test('should include revenue records up to 23:59:59 on the last day of target period and exclude records after that', async () => {
    const targetStartDate = new Date('2024-01-01T00:00:00Z');
    const targetEndDate = new Date('2024-01-31T23:59:59Z');

    const revenueRecords = [
      {
        id: 'REV-001',
        amount: 10000,
        dealId: 'DEAL-001',
        customerId: 'CUST-001',
        recordedAt: new Date('2024-01-31T23:59:58Z'),
        status: 'completed',
      },
      {
        id: 'REV-002',
        amount: 20000,
        dealId: 'DEAL-002',
        customerId: 'CUST-002',
        recordedAt: new Date('2024-01-31T23:59:59Z'),
        status: 'completed',
      },
      {
        id: 'REV-003',
        amount: 30000,
        dealId: 'DEAL-003',
        customerId: 'CUST-003',
        recordedAt: new Date('2024-02-01T00:00:00Z'),
        status: 'completed',
      },
    ];

    const mockDocumentStorageAdapter: Partial<DocumentStorageAdapter> = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'DOC-2024-01-REPORT',
        uploadedAt: new Date('2024-02-01T09:00:00Z').toISOString(),
        fileSize: 245000,
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://drive.google.com/file/d/mock-share-link-id/view',
        expiresAt: new Date('2024-02-08T09:00:00Z').toISOString(),
      }),
      deleteDocument: jest.fn().mockResolvedValue(undefined),
    };

    const report = await generateMonthlyRevenueReport(
      revenueRecords,
      targetStartDate,
      targetEndDate,
      mockDocumentStorageAdapter as DocumentStorageAdapter
    );

    expect(report.aggregatedAmount).toBe(30000);
    expect(report.includedRecordCount).toBe(2);
    expect(report.includedRecordIds).toContain('REV-001');
    expect(report.includedRecordIds).toContain('REV-002');
    expect(report.includedRecordIds).not.toContain('REV-003');
    expect(report.reportPeriodStart).toEqual(targetStartDate.toISOString());
    expect(report.reportPeriodEnd).toEqual(targetEndDate.toISOString());
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(1);
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: expect.stringMatching(/2024-01.*\.pdf$/),
        contentType: 'application/pdf',
      })
    );
  });
});