import { extractMonthlyReport } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-112
  test('月次報告期限・データ抽出処理 - アクセス権削除時はデータ抽出が実行されない', async () => {
    const salesPersonId = 'SALES-001';
    const salesPersonName = '田中太郎';
    const reportDeadline = new Date('2024-01-31T23:59:59Z');
    const accessRevokedAt = new Date('2024-01-31T10:00:00Z');
    const monthlySalesAmount = 1000000;
    const contractCount = 5;

    const mockExecutionLog: { userId: string; success: boolean; errorMessage?: string; timestamp: Date }[] = [];
    const mockDatabase = {
      findSalesPerson: jest.fn().mockResolvedValue({
        id: salesPersonId,
        name: salesPersonName,
        is_active: false,
        access_revoked_at: accessRevokedAt,
      }),
      findSalesData: jest.fn().mockResolvedValue({
        userId: salesPersonId,
        salesAmount: monthlySalesAmount,
        contractCount: contractCount,
        reportPeriod: '2024-01',
      }),
      recordExtractionLog: jest.fn().mockImplementation((log) => {
        mockExecutionLog.push(log);
      }),
      createExtractionRecord: jest.fn(),
    };

    const mockAccessControlService = {
      verifyActiveAccess: jest.fn().mockResolvedValue(false),
      getUserAccessStatus: jest.fn().mockResolvedValue({
        userId: salesPersonId,
        isActive: false,
        accessRevokedAt: accessRevokedAt,
      }),
    };

    const result = await extractMonthlyReport(
      {
        userId: salesPersonId,
        reportDeadline: reportDeadline,
        extractionEnabled: true,
        targetPeriod: '2024-01',
      },
      mockDatabase,
      mockAccessControlService
    );

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('ACCESS_DENIED');
    expect(result.errorMessage).toMatch(/Access denied/);
    expect(result.errorMessage).toMatch(/SALES-001/);
    expect(result.errorMessage).toMatch(/no active permission/);
    expect(mockDatabase.createExtractionRecord).not.toHaveBeenCalled();
    expect(mockExecutionLog.some((log) => log.success === false)).toBe(true);
    expect(
      mockExecutionLog.some(
        (log) =>
          log.errorMessage &&
          log.errorMessage.includes('Access denied') &&
          log.errorMessage.includes('SALES-001')
      )
    ).toBe(true);
    expect(mockAccessControlService.verifyActiveAccess).toHaveBeenCalledWith(salesPersonId);
  });
});