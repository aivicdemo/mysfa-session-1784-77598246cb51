import { ActivityRecordFilterService } from '../../src/logic/it-1';

describe('顧客レコード画面の活動記録フィルタリング機能', () => {
  // SCEN-417
  test('複数タイプが混在する活動記録から、フィルタ対象外のタイプが存在する場合、対象タイプのみが返される', () => {
    // テスト用の活動記録データセットを準備
    // 複数タイプ（電話、メール、訪問、提案）を混在させ、少なくとも3種類以上のタイプを含める
    const activityRecords = [
      {
        id: 'act_001',
        customerId: 'cust_123',
        type: 'phone',
        content: '顧客との電話対応',
        timestamp: new Date('2024-01-15T10:00:00Z'),
        recordedBy: 'user_001',
      },
      {
        id: 'act_002',
        customerId: 'cust_123',
        type: 'email',
        content: '提案資料を送付',
        timestamp: new Date('2024-01-15T11:30:00Z'),
        recordedBy: 'user_001',
      },
      {
        id: 'act_003',
        customerId: 'cust_123',
        type: 'visit',
        content: '現地訪問対応',
        timestamp: new Date('2024-01-15T14:00:00Z'),
        recordedBy: 'user_001',
      },
      {
        id: 'act_004',
        customerId: 'cust_123',
        type: 'proposal',
        content: '提案プレゼン実施',
        timestamp: new Date('2024-01-15T15:30:00Z'),
        recordedBy: 'user_001',
      },
      {
        id: 'act_005',
        customerId: 'cust_123',
        type: 'phone',
        content: '2回目の電話対応',
        timestamp: new Date('2024-01-16T09:00:00Z'),
        recordedBy: 'user_002',
      },
      {
        id: 'act_006',
        customerId: 'cust_123',
        type: 'visit',
        content: '2回目の訪問対応',
        timestamp: new Date('2024-01-16T13:00:00Z'),
        recordedBy: 'user_002',
      },
      {
        id: 'act_007',
        customerId: 'cust_123',
        type: 'email',
        content: '追加提案資料を送付',
        timestamp: new Date('2024-01-16T16:00:00Z'),
        recordedBy: 'user_002',
      },
    ];

    // フィルタ対象のタイプを『電話』と『訪問』に設定する
    const targetTypes = ['phone', 'visit'];

    // ActivityRecordFilterService.filterByType() メソッドを呼び出す
    const filteredRecords = ActivityRecordFilterService.filterByType(
      activityRecords,
      targetTypes
    );

    // 返された結果配列が返されたことを確認する
    expect(Array.isArray(filteredRecords)).toBe(true);

    // 返された結果配列の各要素のタイプ属性を検証し、すべてが『電話』または『訪問』に該当することを確認する
    filteredRecords.forEach((record) => {
      expect(['phone', 'visit']).toContain(record.type);
    });

    // 返された結果配列に『メール』や『提案』などのフィルタ対象外タイプが含まれていないことを確認する
    const filteredTypes = filteredRecords.map((record) => record.type);
    expect(filteredTypes).not.toContain('email');
    expect(filteredTypes).not.toContain('proposal');

    // 返された結果配列のレコード数が、元のデータセット内に存在する『電話』と『訪問』タイプの合計数と一致することを確認する
    const expectedCount = activityRecords.filter((record) =>
      ['phone', 'visit'].includes(record.type)
    ).length;
    expect(filteredRecords).toHaveLength(expectedCount);
    expect(filteredRecords).toHaveLength(4);

    // 期待結果: 返却される活動記録の配列に『電話』と『訪問』のタイプのみが含まれ、
    // 『メール』『提案』等のフィルタ対象外タイプは1件も含まれないこと
    expect(filteredRecords).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'act_001',
          type: 'phone',
        }),
        expect.objectContaining({
          id: 'act_003',
          type: 'visit',
        }),
        expect.objectContaining({
          id: 'act_005',
          type: 'phone',
        }),
        expect.objectContaining({
          id: 'act_006',
          type: 'visit',
        }),
      ])
    );
  });
});