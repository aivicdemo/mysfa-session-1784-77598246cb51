import { filterActivityRecordsByDateRange } from '../../src/logic/it-1';

describe('顧客レコード画面の活動記録フィルタリング機能', () => {
  // SCEN-431: [edge] 活動記録フィルタリング機能 - 月初の日付を持つ活動記録がフィルタされた場合、正しく結果に含まれる
  test('月初から月末の日付範囲でフィルタすると、範囲内の活動記録のみが返される', () => {
    const activityRecords = [
      {
        id: 'activity_001',
        type: 'visit',
        description: '営業訪問',
        createdAt: new Date('2024-04-01T10:00:00Z'),
      },
      {
        id: 'activity_002',
        type: 'call',
        description: '電話対応',
        createdAt: new Date('2024-03-31T15:00:00Z'),
      },
      {
        id: 'activity_003',
        type: 'email',
        description: 'メール送信',
        createdAt: new Date('2024-04-02T09:00:00Z'),
      },
    ];

    const filterCriteria = {
      startDate: new Date('2024-04-01T00:00:00Z'),
      endDate: new Date('2024-04-30T23:59:59Z'),
    };

    const result = filterActivityRecordsByDateRange(activityRecords, filterCriteria);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('activity_001');
    expect(result[0].type).toBe('visit');
    expect(result[0].createdAt).toEqual(new Date('2024-04-01T10:00:00Z'));
    expect(result[1].id).toBe('activity_003');
    expect(result[1].type).toBe('email');
    expect(result[1].createdAt).toEqual(new Date('2024-04-02T09:00:00Z'));
    expect(result.every(record => record.createdAt >= filterCriteria.startDate && record.createdAt <= filterCriteria.endDate)).toBe(true);
  });
});