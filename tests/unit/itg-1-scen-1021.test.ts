import { fetchDashboardWithFallback } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-1021
  test('Salesforce API呼び出しが失敗した場合、エラーメッセージとキャッシュデータを表示', async () => {
    const lastSuccessfulUpdateTime = new Date('2024-01-14T15:30:00Z');
    const cachedDashboardData = {
      users: [
        { userId: 'U001', edition: 'Professional' },
        { userId: 'U002', edition: 'Professional' },
        { userId: 'U003', edition: 'Enterprise' },
        { userId: 'U004', edition: 'Enterprise' },
        { userId: 'U005', edition: 'Professional' },
      ],
      editions: [
        { name: 'Professional', contractCount: 1, usageCount: 1 },
        { name: 'Enterprise', contractCount: 1, usageCount: 1 },
      ],
      featureUsageMetrics: [
        { featureName: 'API呼び出し', usagePercent: 75 },
        { featureName: 'ストレージ', usagePercent: 45 },
      ],
      annualCostData: {
        totalAnnualCost: 3000000,
      },
      lastUpdatedAt: lastSuccessfulUpdateTime,
    };

    const mockSalesforceDataSource = {
      fetchLicenseUsers: jest.fn().mockRejectedValue(
        new Error('Network timeout: Salesforce connection failed')
      ),
      fetchEditionDetails: jest.fn().mockRejectedValue(
        new Error('Network timeout: Salesforce connection failed')
      ),
      fetchFeatureUsageMetrics: jest.fn().mockRejectedValue(
        new Error('Network timeout: Salesforce connection failed')
      ),
      fetchAnnualCostData: jest.fn().mockRejectedValue(
        new Error('Network timeout: Salesforce connection failed')
      ),
    };

    const mockCacheStore = {
      getDashboardCache: jest.fn().mockReturnValue(cachedDashboardData),
      updateDashboardCache: jest.fn(),
    };

    const mockTimerControl = {
      scheduleRetry: jest.fn((delayMs, callback) => {
        callback();
      }),
    };

    const result = await fetchDashboardWithFallback(
      mockSalesforceDataSource,
      mockCacheStore,
      mockTimerControl
    );

    expect(result).toEqual({
      hasError: true,
      errorMessage: 'Salesforce接続エラー。最後の更新時刻：2024年1月14日 15時30分',
      dashboardData: {
        users: cachedDashboardData.users,
        editions: cachedDashboardData.editions,
        featureUsageMetrics: cachedDashboardData.featureUsageMetrics,
        annualCostData: cachedDashboardData.annualCostData,
      },
      isRealtimeData: false,
    });

    expect(mockSalesforceDataSource.fetchLicenseUsers).toHaveBeenCalled();
    expect(mockSalesforceDataSource.fetchEditionDetails).toHaveBeenCalled();
    expect(mockSalesforceDataSource.fetchFeatureUsageMetrics).toHaveBeenCalled();
    expect(mockSalesforceDataSource.fetchAnnualCostData).toHaveBeenCalled();
  });
});