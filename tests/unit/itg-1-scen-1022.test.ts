import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { fetchLicenseUsersWithRetry } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-1022
  test('Salesforce Metadata API呼び出し失敗時に指数バックオフで最大3回の再試行が実行される', async () => {
    const retryAttempts: Array<{ timestamp: number; error: string }> = [];
    let callCount = 0;
    const startTime = Date.now();

    const mockSalesforceDataSource = {
      fetchLicenseUsers: jest.fn(async () => {
        callCount++;
        const currentTime = Date.now();
        retryAttempts.push({
          timestamp: currentTime - startTime,
          error: callCount === 1 ? 'timeout' : callCount === 2 ? 'connection' : 'authentication',
        });

        if (callCount === 1) {
          throw new Error('Salesforce connection timeout');
        }
        if (callCount === 2) {
          throw new Error('Salesforce connection error');
        }
        if (callCount === 3) {
          throw new Error('Salesforce authentication failed');
        }

        return [];
      }),
      fetchEditionDetails: jest.fn(async () => []),
      fetchFeatureUsageMetrics: jest.fn(async () => ({})),
      fetchAnnualCostData: jest.fn(async () => ({})),
    };

    const cachedPreviousData = {
      lastUpdateTime: new Date('2024-01-15T10:00:00Z'),
      users: [{ id: 'user001', edition: 'Professional' }],
    };

    let result: any;
    let errorThrown: Error | null = null;

    try {
      result = await fetchLicenseUsersWithRetry(
        mockSalesforceDataSource,
        cachedPreviousData,
        3
      );
    } catch (err) {
      errorThrown = err as Error;
    }

    expect(mockSalesforceDataSource.fetchLicenseUsers).toHaveBeenCalledTimes(3);

    expect(retryAttempts).toHaveLength(3);
    expect(retryAttempts[0].error).toBe('timeout');
    expect(retryAttempts[1].error).toBe('connection');
    expect(retryAttempts[2].error).toBe('authentication');

    const firstRetryInterval = retryAttempts[1].timestamp - retryAttempts[0].timestamp;
    const secondRetryInterval = retryAttempts[2].timestamp - retryAttempts[1].timestamp;

    const toleranceMs = 500;
    expect(Math.abs(firstRetryInterval - 60000)).toBeLessThan(toleranceMs);
    expect(Math.abs(secondRetryInterval - 300000)).toBeLessThan(toleranceMs);

    expect(errorThrown).not.toBeNull();
    expect(errorThrown?.message).toMatch(/Salesforce|接続|認証/);

    expect(result).toEqual({
      status: 'error',
      message: 'Salesforce接続エラー。最後の更新時刻：2024年01月15日 10時',
      cachedData: cachedPreviousData,
    });
  });
});