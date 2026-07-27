import { searchActivityRecordsByDateRange } from '../../src/logic/it-1';

describe('顧客レコード画面の商談履歴・活動記録表示', () => {
  test('SCEN-479: 開始日と終了日が同日の期間で活動記録を検索するとき、その日のレコードのみ返される', () => {
    // 準備: テスト用の活動記録データを作成
    const activityRecords = [
      {
        id: 'activity_001',
        customerId: 'cust_123',
        activityDate: new Date('2024-01-14T10:00:00Z'),
        activityType: 'email',
        description: '見積書送信',
        createdAt: new Date('2024-01-14T10:00:00Z'),
      },
      {
        id: 'activity_002',
        customerId: 'cust_123',
        activityDate: new Date('2024-01-15T09:30:00Z'),
        activityType: 'visit',
        description: '顧客訪問',
        createdAt: new Date('2024-01-15T09:30:00Z'),
      },
      {
        id: 'activity_003',
        customerId: 'cust_123',
        activityDate: new Date('2024-01-15T14:15:00Z'),
        activityType: 'phone',
        description: '電話確認',
        createdAt: new Date('2024-01-15T14:15:00Z'),
      },
      {
        id: 'activity_004',
        customerId: 'cust_123',
        activityDate: new Date('2024-01-16T11:00:00Z'),
        activityType: 'email',
        description: '提案資料送信',
        createdAt: new Date('2024-01-16T11:00:00Z'),
      },
    ];

    // 実行: 開始日と終了日を同日（2024年1月15日）で設定して活動記録を検索
    const startDate = new Date('2024-01-15T00:00:00Z');
    const endDate = new Date('2024-01-15T23:59:59Z');
    const result = searchActivityRecordsByDateRange(
      activityRecords,
      startDate,
      endDate
    );

    // 検証: 2024年1月15日のレコードのみが返される
    expect(result).toEqual([
      {
        id: 'activity_002',
        customerId: 'cust_123',
        activityDate: new Date('2024-01-15T09:30:00Z'),
        activityType: 'visit',
        description: '顧客訪問',
        createdAt: new Date('2024-01-15T09:30:00Z'),
      },
      {
        id: 'activity_003',
        customerId: 'cust_123',
        activityDate: new Date('2024-01-15T14:15:00Z'),
        activityType: 'phone',
        description: '電話確認',
        createdAt: new Date('2024-01-15T14:15:00Z'),
      },
    ]);

    // 検証: 返却されたレコード件数が2件であることを確認
    expect(result.length).toBe(2);
  });
});