import { validateMigrationCompletion } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-989: [edge] 移行完了判定機能 - 移行前Salesforceから移行後システムへのレコード引継件数が1件過剰の場合、件数不整合として検出される
  test('should detect OVERAGE discrepancy when actual records exceed expected count by 1', async () => {
    // Setup: 移行前Salesforce環境のレコード総件数 = 1000件
    const expectedRecordCount = 1000;
    const actualRecordCount = 1001;
    const discrepancy = actualRecordCount - expectedRecordCount;

    // Stub: SalesforceMetadataDataSource.fetchLicenseUsers
    const stubSalesforceDataSource = {
      fetchLicenseUsers: jest.fn().mockResolvedValue({
        records: Array.from({ length: expectedRecordCount }, (_, i) => ({
          id: `salesforce_user_${i + 1}`,
          email: `user${i + 1}@example.com`,
          editionType: 'Professional',
          isActive: true,
        })),
        totalCount: expectedRecordCount,
      }),
      fetchEditionDetails: jest.fn().mockResolvedValue({}),
      fetchFeatureUsageMetrics: jest.fn().mockResolvedValue({}),
      fetchAnnualCostData: jest.fn().mockResolvedValue({}),
    };

    // Setup: 移行後システムのデータベースに1001件のレコードを事前投入
    const mockDatabaseRecords = Array.from(
      { length: actualRecordCount },
      (_, i) => ({
        id: `migrated_record_${i + 1}`,
        sourceId: i < expectedRecordCount ? `salesforce_user_${i + 1}` : `orphaned_record_${i + 1}`,
        migratedAt: new Date('2024-01-15T11:00:00Z'),
        status: 'COMPLETED',
      })
    );

    const mockDatabaseAdapter = {
      getRecordCount: jest.fn().mockResolvedValue(actualRecordCount),
      getAllRecords: jest.fn().mockResolvedValue(mockDatabaseRecords),
    };

    // Execute: 移行完了判定機能を実行
    const result = await validateMigrationCompletion(
      stubSalesforceDataSource,
      mockDatabaseAdapter,
      {
        checkTimestamp: new Date('2024-01-15T12:00:00Z'),
      }
    );

    // Assert: 件数不整合の検出を確認
    expect(result.migrationMismatchDetected).toBe(true);
    expect(result.expectedRecordCount).toBe(1000);
    expect(result.actualRecordCount).toBe(1001);
    expect(result.discrepancy).toBe(1);
    expect(result.discrepancyType).toBe('OVERAGE');
    expect(result.status).toBe('MISMATCH_DETECTED');

    // Assert: 不整合ログの詳細情報
    expect(result.mismatchLog).toBeDefined();
    expect(result.mismatchLog.detectedAt).toEqual(new Date('2024-01-15T12:00:00Z'));
    expect(result.mismatchLog.expectedCount).toBe(1000);
    expect(result.mismatchLog.actualCount).toBe(1001);
    expect(result.mismatchLog.countDifference).toBe(1);
    expect(result.mismatchLog.cause).toBe('OVERAGE');

    // Verify: SalesforceMetadataDataSource が正しく呼び出されたことを確認
    expect(stubSalesforceDataSource.fetchLicenseUsers).toHaveBeenCalled();
    expect(mockDatabaseAdapter.getRecordCount).toHaveBeenCalled();
  });
});