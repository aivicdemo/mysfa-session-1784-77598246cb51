import { filterActivityRecordsByType } from '../../src/logic/it-1';

describe('顧客レコード画面の活動記録フィルタリング機能', () => {
  // SCEN-426
  test('フィルタ対象タイプが空文字列の場合、空配列が返される', () => {
    const userId = 'user-001';
    const startDate = new Date('2024-01-01T00:00:00Z');
    const endDate = new Date('2024-01-31T23:59:59Z');
    const filterType = '';

    const activityRecords = [
      {
        id: 'activity-001',
        userId: 'user-001',
        type: 'email',
        content: 'Customer inquiry',
        createdAt: new Date('2024-01-15T10:00:00Z'),
      },
      {
        id: 'activity-002',
        userId: 'user-001',
        type: 'phone',
        content: 'Follow-up call',
        createdAt: new Date('2024-01-20T14:30:00Z'),
      },
      {
        id: 'activity-003',
        userId: 'user-001',
        type: 'visit',
        content: 'Office visit',
        createdAt: new Date('2024-01-25T09:00:00Z'),
      },
    ];

    const result = filterActivityRecordsByType(
      activityRecords,
      userId,
      startDate,
      endDate,
      filterType
    );

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});