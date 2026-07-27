import { filterActivityRecords } from '../../src/logic/it-1';

describe('顧客レコード画面の過去商談履歴・活動記録・課題解決状況表示機能', () => {
  // SCEN-424
  test('活動記録フィルタリング機能 - フィルタ対象タイプがnullの場合、空配列が返される', () => {
    const activityRecords = [
      {
        id: 'activity_001',
        customerId: 'customer_001',
        type: 'email',
        description: 'メール送信',
        recordedAt: new Date('2024-01-15T10:00:00Z'),
      },
      {
        id: 'activity_002',
        customerId: 'customer_001',
        type: 'phone',
        description: '電話対応',
        recordedAt: new Date('2024-01-14T14:30:00Z'),
      },
      {
        id: 'activity_003',
        customerId: 'customer_001',
        type: 'visit',
        description: '訪問対応',
        recordedAt: new Date('2024-01-13T09:15:00Z'),
      },
    ];

    const userId = 'user_001';
    const startDate = new Date('2024-01-01T00:00:00Z');
    const endDate = new Date('2024-01-31T23:59:59Z');
    const filterType = null;

    const result = filterActivityRecords(
      activityRecords,
      userId,
      startDate,
      endDate,
      filterType
    );

    expect(result).toEqual([]);
    expect(result.length).toBe(0);
  });
});