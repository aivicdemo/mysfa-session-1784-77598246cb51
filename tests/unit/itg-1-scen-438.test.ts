import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { fetchDealHistoryAndActivities } from '../../src/logic/it-1';

describe('顧客レコード画面の商談履歴・活動記録表示 - キャッシュ機構', () => {
  let mockCurrentTime: Date;
  let originalDateNow: () => number;
  let dataSourceSpy: jest.Mock;
  let mockDataSource: {
    getDealHistoryAndActivities: jest.Mock;
  };

  beforeEach(() => {
    mockCurrentTime = new Date('2024-06-15T14:00:00Z');
    originalDateNow = Date.now;
    Date.now = jest.fn(() => mockCurrentTime.getTime());

    mockDataSource = {
      getDealHistoryAndActivities: jest.fn().mockResolvedValue({
        deals: [
          {
            deal_id: 'DEAL001',
            customer_id: 'CUST001',
            deal_name: '契約A',
            status: '交渉中',
            amount: 500000,
            created_at: '2024-06-10T10:00:00Z',
          },
        ],
        activities: [
          {
            activity_id: 'ACT001',
            deal_id: 'DEAL001',
            activity_type: 'email',
            description: '提案資料を送付',
            recorded_at: '2024-06-12T15:30:00Z',
          },
        ],
        last_fetched_at: mockCurrentTime.toISOString(),
      }),
    };

    dataSourceSpy = mockDataSource.getDealHistoryAndActivities;
  });

  afterEach(() => {
    Date.now = originalDateNow;
    jest.clearAllMocks();
  });

  // SCEN-438
  test('キャッシュ有効期限満了後1秒の状態では再取得トリガーが発火する', async () => {
    const customerId = 'CUST001';
    const cacheValidityDurationMs = 3600000; // 1時間
    const cacheExpirationTime = new Date(mockCurrentTime.getTime() + cacheValidityDurationMs);

    // 初回取得: キャッシュに格納
    const initialFetchResult = await fetchDealHistoryAndActivities(
      customerId,
      {
        getDealHistoryAndActivities: dataSourceSpy,
      },
      {
        cacheValidityDurationMs,
        currentTimeProvider: () => mockCurrentTime,
      }
    );

    expect(initialFetchResult).toBeDefined();
    expect(initialFetchResult.deals).toHaveLength(1);
    expect(initialFetchResult.activities).toHaveLength(1);
    expect(dataSourceSpy).toHaveBeenCalledTimes(1);

    // システム時刻をキャッシュ有効期限満了後1秒に設定
    mockCurrentTime = new Date(cacheExpirationTime.getTime() + 1000);

    // 2回目取得: キャッシュ期限切れなので再フェッチが発動
    const secondFetchResult = await fetchDealHistoryAndActivities(
      customerId,
      {
        getDealHistoryAndActivities: dataSourceSpy,
      },
      {
        cacheValidityDurationMs,
        currentTimeProvider: () => mockCurrentTime,
      }
    );

    // 再取得メソッドが呼び出されたことを検証（初回+再フェッチ=2回以上）
    expect(dataSourceSpy).toHaveBeenCalledTimes(2);
    expect(secondFetchResult).toBeDefined();
    expect(secondFetchResult.deals).toHaveLength(1);
    expect(secondFetchResult.activities).toHaveLength(1);
  });
});