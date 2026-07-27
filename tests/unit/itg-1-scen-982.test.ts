import { determineMigrationCompletion } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成 - 移行完了判定', () => {
  // SCEN-982
  test('不整合件数がちょうど許容閾値（5件）と一致する場合、移行完了として判定される', () => {
    const toleranceThreshold = 5;
    const discrepancyCount = 5;

    const mockSalesforceDataSource = {
      fetchLicenseUsers: jest.fn().mockResolvedValue({
        users: [
          { userId: 'USR001', edition: 'Professional', status: 'active' },
          { userId: 'USR002', edition: 'Enterprise', status: 'active' },
          { userId: 'USR003', edition: 'Unlimited', status: 'active' },
        ],
      }),
      fetchEditionDetails: jest.fn().mockResolvedValue({
        editions: [
          { name: 'Professional', contractCount: 10, usageCount: 9 },
          { name: 'Enterprise', contractCount: 5, usageCount: 5 },
          { name: 'Unlimited', contractCount: 3, usageCount: 2 },
        ],
      }),
      fetchFeatureUsageMetrics: jest.fn().mockResolvedValue({
        features: [
          { name: 'API_CALLS', usageRate: 0.75, limit: 1000000 },
          { name: 'STORAGE', usageRate: 0.50, limit: 5000 },
        ],
      }),
      fetchAnnualCostData: jest.fn().mockResolvedValue({
        contracts: [
          { edition: 'Professional', annualCost: 150000, renewalDate: '2025-12-31' },
          { edition: 'Enterprise', annualCost: 300000, renewalDate: '2025-12-31' },
        ],
      }),
    };

    const mockNotificationService = {
      sendLicenseOverageAlert: jest.fn().mockResolvedValue({ sent: true }),
      sendUnusedUserAlert: jest.fn().mockResolvedValue({ sent: true }),
      sendCostForecastAlert: jest.fn().mockResolvedValue({ sent: true }),
    };

    const migrationDataset = {
      recordsWithDiscrepancies: [
        { recordId: 'REC001', sfValue: 'active', localValue: 'inactive' },
        { recordId: 'REC002', sfValue: 50000, localValue: 50100 },
        { recordId: 'REC003', sfValue: 'Professional', localValue: 'Enterprise' },
        { recordId: 'REC004', sfValue: '2024-01-15', localValue: '2024-01-16' },
        { recordId: 'REC005', sfValue: 'COMPLETE', localValue: 'PENDING' },
      ],
      totalRecordsMigrated: 1000,
      migrationStartDate: new Date('2024-01-01T00:00:00Z'),
      migrationEndDate: new Date('2024-06-30T23:59:59Z'),
    };

    const internalMigrationState = {
      migrationStatus: 'IN_PROGRESS',
      discrepanciesDetected: discrepancyCount,
      toleranceThreshold: toleranceThreshold,
      isCompletionAllowed: false,
    };

    const completionNotificationTriggered = jest.fn();

    const result = determineMigrationCompletion(
      migrationDataset,
      internalMigrationState,
      toleranceThreshold,
      mockSalesforceDataSource,
      mockNotificationService,
      completionNotificationTriggered
    );

    expect(result).toBe(true);

    expect(internalMigrationState.migrationStatus).toBe('COMPLETED');
    expect(internalMigrationState.isCompletionAllowed).toBe(true);

    expect(completionNotificationTriggered).toHaveBeenCalled();
    expect(completionNotificationTriggered).toHaveBeenCalledWith({
      migrationCompletedAt: expect.any(Date),
      totalRecordsMigrated: 1000,
      resolvedDiscrepancies: 5,
      toleranceThresholdUsed: 5,
      status: 'COMPLETED',
    });

    expect(mockSalesforceDataSource.fetchLicenseUsers).toHaveBeenCalled();
    expect(mockSalesforceDataSource.fetchEditionDetails).toHaveBeenCalled();
    expect(mockSalesforceDataSource.fetchFeatureUsageMetrics).toHaveBeenCalled();
    expect(mockSalesforceDataSource.fetchAnnualCostData).toHaveBeenCalled();

    expect(mockNotificationService.sendLicenseOverageAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'INFO',
        message: expect.stringContaining('migration completed'),
      })
    );
  });
});