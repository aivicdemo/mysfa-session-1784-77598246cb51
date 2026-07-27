import { verifyMigrationCompletion } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-987
  test('移行前Salesforceから移行後システムへのレコード引継件数がちょうど0件差の場合、件数一致と判定される', () => {
    const salesforceRecordCount = 100;
    const migratedRecordCount = 100;
    const recordCountDifference = 0;

    const mockSalesforceMetadataDataSource = {
      fetchLicenseUsers: jest.fn().mockResolvedValue({
        totalUserCount: salesforceRecordCount,
      }),
      fetchEditionDetails: jest.fn().mockResolvedValue({
        editionCount: salesforceRecordCount,
      }),
      fetchFeatureUsageMetrics: jest.fn().mockResolvedValue({
        featureUsageRecords: salesforceRecordCount,
      }),
      fetchAnnualCostData: jest.fn().mockResolvedValue({
        costRecords: salesforceRecordCount,
      }),
    };

    const migrationData = {
      salesforceRecordCount,
      migratedRecordCount,
      recordCountDifference,
    };

    const result = verifyMigrationCompletion(
      migrationData,
      mockSalesforceMetadataDataSource
    );

    expect(result.isCountMatched).toBe(true);
    expect(result.migrationStatus).toBe('完了');
    expect(result.recordCountDifference).toBe(0);
  });
});