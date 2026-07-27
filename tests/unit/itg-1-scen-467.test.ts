import { fetchCustomerTransactionHistory } from '../../src/logic/it-1';

describe('顧客レコード画面の商談履歴・活動記録表示', () => {
  // SCEN-467
  test('キャッシュ再取得判定の結果が真のとき、新しいデータセットが返される', () => {
    const customerId = 'CUST-001';
    const cacheTimestamp = new Date('2024-01-15T10:00:00Z').getTime();
    const currentTimestamp = new Date('2024-01-15T11:30:00Z').getTime();
    const cacheValidityMs = 60 * 60 * 1000; // 1時間

    const dealHistoryNew = [
      {
        dealId: 'DEAL-101',
        customerId: 'CUST-001',
        dealName: '新規案件A',
        status: '受注',
        amount: 500000,
        recordedAt: new Date('2024-01-15T11:20:00Z'),
      },
      {
        dealId: 'DEAL-102',
        customerId: 'CUST-001',
        dealName: '既存案件B',
        status: '提案中',
        amount: 300000,
        recordedAt: new Date('2024-01-15T10:50:00Z'),
      },
    ];

    const activityRecordsNew = [
      {
        activityId: 'ACT-201',
        customerId: 'CUST-001',
        dealId: 'DEAL-101',
        activityType: 'メール',
        recordedAt: new Date('2024-01-15T11:15:00Z'),
        description: '新しいメール通知',
      },
      {
        activityId: 'ACT-202',
        customerId: 'CUST-001',
        dealId: 'DEAL-102',
        activityType: '訪問',
        recordedAt: new Date('2024-01-15T10:45:00Z'),
        description: '新しい訪問記録',
      },
    ];

    const shouldRefreshCache = (
      lastCacheTime: number,
      now: number,
      validity: number
    ): boolean => {
      return now - lastCacheTime > validity;
    };

    const mockFetchNewData = jest.fn().mockResolvedValue({
      deals: dealHistoryNew,
      activities: activityRecordsNew,
    });

    const cacheRefreshRequired = shouldRefreshCache(
      cacheTimestamp,
      currentTimestamp,
      cacheValidityMs
    );

    expect(cacheRefreshRequired).toBe(true);

    return fetchCustomerTransactionHistory(
      customerId,
      {
        shouldRefreshCache: shouldRefreshCache,
        fetchNewData: mockFetchNewData,
        lastCacheTimestamp: cacheTimestamp,
        currentTimestamp: currentTimestamp,
        cacheValidityMs: cacheValidityMs,
      }
    ).then((result) => {
      expect(mockFetchNewData).toHaveBeenCalledWith(customerId);
      expect(result.deals).toEqual(dealHistoryNew);
      expect(result.activities).toEqual(activityRecordsNew);
      expect(result.deals).toHaveLength(2);
      expect(result.activities).toHaveLength(2);
      expect(result.deals[0].dealId).toBe('DEAL-101');
      expect(result.activities[0].activityType).toBe('メール');
    });
  });
});