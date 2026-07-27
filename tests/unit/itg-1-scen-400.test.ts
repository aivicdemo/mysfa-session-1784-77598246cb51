import { mergeAndSortDealAndActivityRecords } from '../../src/logic/it-1';

describe('顧客レコード画面の過去商談履歴・活動記録の時系列表示機能', () => {
  // SCEN-400
  test('商談と活動記録が時系列で混在しているとき、すべてが統合して最新順にソートされる', () => {
    const mockDeals = [
      {
        id: 'deal_001',
        type: 'deal',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        title: '商談1',
        amount: 100000,
      },
      {
        id: 'deal_002',
        type: 'deal',
        createdAt: new Date('2024-01-20T14:30:00Z'),
        title: '商談2',
        amount: 200000,
      },
      {
        id: 'deal_003',
        type: 'deal',
        createdAt: new Date('2024-01-10T09:00:00Z'),
        title: '商談3',
        amount: 150000,
      },
    ];

    const mockActivities = [
      {
        id: 'activity_001',
        type: 'activity',
        createdAt: new Date('2024-01-18T16:45:00Z'),
        description: '活動記録1',
        activityType: 'email',
      },
      {
        id: 'activity_002',
        type: 'activity',
        createdAt: new Date('2024-01-12T11:20:00Z'),
        description: '活動記録2',
        activityType: 'call',
      },
      {
        id: 'activity_003',
        type: 'activity',
        createdAt: new Date('2024-01-22T13:15:00Z'),
        description: '活動記録3',
        activityType: 'visit',
      },
      {
        id: 'activity_004',
        type: 'activity',
        createdAt: new Date('2024-01-11T08:30:00Z'),
        description: '活動記録4',
        activityType: 'email',
      },
    ];

    const result = mergeAndSortDealAndActivityRecords(mockDeals, mockActivities);

    expect(result).toHaveLength(7);

    expect(result[0]).toEqual({
      id: 'activity_003',
      type: 'activity',
      createdAt: new Date('2024-01-22T13:15:00Z'),
      description: '活動記録3',
      activityType: 'visit',
    });

    expect(result[1]).toEqual({
      id: 'deal_002',
      type: 'deal',
      createdAt: new Date('2024-01-20T14:30:00Z'),
      title: '商談2',
      amount: 200000,
    });

    expect(result[2]).toEqual({
      id: 'activity_001',
      type: 'activity',
      createdAt: new Date('2024-01-18T16:45:00Z'),
      description: '活動記録1',
      activityType: 'email',
    });

    expect(result[3]).toEqual({
      id: 'deal_001',
      type: 'deal',
      createdAt: new Date('2024-01-15T10:00:00Z'),
      title: '商談1',
      amount: 100000,
    });

    expect(result[4]).toEqual({
      id: 'activity_002',
      type: 'activity',
      createdAt: new Date('2024-01-12T11:20:00Z'),
      description: '活動記録2',
      activityType: 'call',
    });

    expect(result[5]).toEqual({
      id: 'activity_004',
      type: 'activity',
      createdAt: new Date('2024-01-11T08:30:00Z'),
      description: '活動記録4',
      activityType: 'email',
    });

    expect(result[6]).toEqual({
      id: 'deal_003',
      type: 'deal',
      createdAt: new Date('2024-01-10T09:00:00Z'),
      title: '商談3',
      amount: 150000,
    });

    const timestamps = result.map(record => record.createdAt.getTime());
    for (let i = 0; i < timestamps.length - 1; i++) {
      expect(timestamps[i]).toBeGreaterThan(timestamps[i + 1]);
    }
  });
});