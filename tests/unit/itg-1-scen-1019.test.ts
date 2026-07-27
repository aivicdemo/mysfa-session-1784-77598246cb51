import { fetchFeatureUsageMetrics } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  test('SCEN-1019: Salesforce Metadata API連携 - fetchFeatureUsageMetricsが成功応答を受けた場合、各機能の利用率・上限・残容量が取得される', async () => {
    // Arrange: スタブの成功応答を構成
    const mockSalesforceDataSource = {
      fetchFeatureUsageMetrics: jest.fn().mockResolvedValue({
        features: [
          {
            name: 'API Calls',
            currentValue: 50000,
            limit: 100000,
          },
          {
            name: 'File Storage',
            currentValue: 8.5,
            limitValue: 20,
            unit: 'GB',
          },
          {
            name: 'Automation Executions',
            currentValue: 45000,
            limit: 300000,
          },
        ],
      }),
    };

    // Act: fetchFeatureUsageMetricsを呼び出す
    const result = await fetchFeatureUsageMetrics(mockSalesforceDataSource);

    // Assert: 戻り値のパース処理と各機能メトリクスの正確性を検証
    expect(result).toEqual({
      features: [
        {
          name: 'API Calls',
          utilizationRate: 50,
          limit: 100000,
          remainingCapacity: 50000,
        },
        {
          name: 'File Storage',
          utilizationRate: 42.5,
          limit: '20GB',
          remainingCapacity: '11.5GB',
        },
        {
          name: 'Automation Executions',
          utilizationRate: 15,
          limit: 300000,
          remainingCapacity: 255000,
        },
      ],
    });

    // Assert: スタブメソッドが呼び出されたことを確認
    expect(mockSalesforceDataSource.fetchFeatureUsageMetrics).toHaveBeenCalledTimes(1);
  });
});