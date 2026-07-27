import { fetchCustomerRecordWithCache } from '../../src/logic/it-1';

describe('顧客レコード画面の商談履歴・活動記録表示', () => {
  test('SCEN-468: キャッシュ再取得判定の結果が偽のとき、キャッシュ済みのデータセットが返される', () => {
    const customerId = 'CUST-20240115-001';
    const cachedTimestamp = new Date('2024-01-15T10:00:00Z');
    const currentTimestamp = new Date('2024-01-15T12:30:00Z');

    const cachedDeals = [
      {
        dealId: 'DEAL-2024-0001',
        customerId: customerId,
        dealName: 'ABC社システム導入案件',
        dealAmount: 5000000,
        dealStatus: '交渉中',
        dealStartDate: new Date('2024-01-10T09:00:00Z'),
        dealCloseDateExpected: new Date('2024-02-28T23:59:59Z'),
      },
      {
        dealId: 'DEAL-2024-0002',
        customerId: customerId,
        dealName: 'XYZ社保守契約更新',
        dealAmount: 1200000,
        dealStatus: '受注',
        dealStartDate: new Date('2024-01-05T09:00:00Z'),
        dealCloseDateExpected: new Date('2024-01-20T23:59:59Z'),
      },
    ];

    const cachedActivities = [
      {
        activityId: 'ACT-2024-00001',
        dealId: 'DEAL-2024-0001',
        activityType: '訪問',
        activityDate: new Date('2024-01-14T14:30:00Z'),
        ownerName: '山田太郎',
        description: 'システム要件ヒアリング',
        completedFlag: true,
      },
      {
        activityId: 'ACT-2024-00002',
        dealId: 'DEAL-2024-0001',
        activityType: 'メール',
        activityDate: new Date('2024-01-12T11:00:00Z'),
        ownerName: '鈴木次郎',
        description: '見積書を送付',
        completedFlag: true,
      },
      {
        activityId: 'ACT-2024-00003',
        dealId: 'DEAL-2024-0002',
        activityType: '電話',
        activityDate: new Date('2024-01-08T10:15:00Z'),
        ownerName: '山田太郎',
        description: '保守内容の確認',
        completedFlag: true,
      },
    ];

    const cachedDataset = {
      deals: cachedDeals,
      activities: cachedActivities,
      cacheTimestamp: cachedTimestamp,
    };

    const shouldRefreshCacheMock = jest.fn().mockReturnValue(false);

    const result = fetchCustomerRecordWithCache(
      customerId,
      cachedDataset,
      shouldRefreshCacheMock,
      currentTimestamp
    );

    expect(shouldRefreshCacheMock).toHaveBeenCalledTimes(1);
    expect(shouldRefreshCacheMock).toHaveBeenCalledWith(cachedTimestamp, currentTimestamp);

    expect(result).toEqual({
      deals: cachedDeals,
      activities: cachedActivities,
      cacheTimestamp: cachedTimestamp,
      sourceType: 'cache',
    });

    expect(result.deals).toHaveLength(2);
    expect(result.deals[0]).toEqual({
      dealId: 'DEAL-2024-0001',
      customerId: customerId,
      dealName: 'ABC社システム導入案件',
      dealAmount: 5000000,
      dealStatus: '交渉中',
      dealStartDate: new Date('2024-01-10T09:00:00Z'),
      dealCloseDateExpected: new Date('2024-02-28T23:59:59Z'),
    });

    expect(result.activities).toHaveLength(3);
    expect(result.activities[0]).toEqual({
      activityId: 'ACT-2024-00001',
      dealId: 'DEAL-2024-0001',
      activityType: '訪問',
      activityDate: new Date('2024-01-14T14:30:00Z'),
      ownerName: '山田太郎',
      description: 'システム要件ヒアリング',
      completedFlag: true,
    });

    expect(result.cacheTimestamp).toEqual(cachedTimestamp);
  });
});