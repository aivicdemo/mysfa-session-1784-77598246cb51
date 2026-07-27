import { filterActivityRecordsByType } from '../../src/logic/it-1';

describe('顧客レコード画面の過去商談履歴・活動記録・課題解決状況表示機能', () => {
  // SCEN-420
  test('活動記録フィルタリング機能 - 同じ日付で時刻が異なる複数の活動記録がフィルタされた場合、時刻の昇順で返される', () => {
    const activityRecords = [
      {
        id: 'activity_001',
        customerId: 'cust_123',
        type: 'email',
        timestamp: new Date('2024-01-15T14:15:00Z'),
        description: 'Customer inquiry response',
        createdAt: new Date('2024-01-15T14:15:00Z'),
      },
      {
        id: 'activity_002',
        customerId: 'cust_123',
        type: 'email',
        timestamp: new Date('2024-01-15T09:30:00Z'),
        description: 'Initial contact',
        createdAt: new Date('2024-01-15T09:30:00Z'),
      },
      {
        id: 'activity_003',
        customerId: 'cust_123',
        type: 'email',
        timestamp: new Date('2024-01-15T11:45:00Z'),
        description: 'Follow-up call',
        createdAt: new Date('2024-01-15T11:45:00Z'),
      },
    ];

    const filterCondition = {
      type: 'email',
      date: new Date('2024-01-15'),
    };

    const result = filterActivityRecordsByType(activityRecords, filterCondition);

    expect(result).toHaveLength(3);
    expect(result[0].timestamp).toEqual(new Date('2024-01-15T09:30:00Z'));
    expect(result[1].timestamp).toEqual(new Date('2024-01-15T11:45:00Z'));
    expect(result[2].timestamp).toEqual(new Date('2024-01-15T14:15:00Z'));
    expect(result[0].id).toBe('activity_002');
    expect(result[1].id).toBe('activity_003');
    expect(result[2].id).toBe('activity_001');
  });
});