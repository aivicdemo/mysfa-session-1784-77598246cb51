import { filterActivityRecordsByType } from '../../src/logic/it-1';

describe('顧客レコード画面の活動記録タイプフィルタリング機能', () => {
  test('SCEN-157: 無効なタイプで絞り込んだ場合にエラーが発生する', () => {
    const activityRecords = [
      {
        id: '1',
        type: 'EMAIL',
        description: 'Sent email',
        createdAt: new Date('2024-01-10T10:00:00Z'),
      },
      {
        id: '2',
        type: 'PHONE',
        description: 'Made phone call',
        createdAt: new Date('2024-01-12T14:30:00Z'),
      },
      {
        id: '3',
        type: 'VISIT',
        description: 'Visited customer',
        createdAt: new Date('2024-01-15T09:00:00Z'),
      },
    ];

    const validTypes = ['EMAIL', 'PHONE', 'VISIT'];

    // Test: 無効なタイプ値 'INVALID_TYPE' で絞り込むとエラーが発生する
    expect(() =>
      filterActivityRecordsByType(activityRecords, 'INVALID_TYPE', validTypes)
    ).toThrow(/タイプ/);

    // Test: 存在しないタイプID '9999' で絞り込むとエラーが発生する
    expect(() =>
      filterActivityRecordsByType(activityRecords, '9999', validTypes)
    ).toThrow(/タイプ/);

    // Test: 有効なタイプで絞り込むと成功する
    const result = filterActivityRecordsByType(
      activityRecords,
      'EMAIL',
      validTypes
    );
    expect(result).toEqual([
      {
        id: '1',
        type: 'EMAIL',
        description: 'Sent email',
        createdAt: new Date('2024-01-10T10:00:00Z'),
      },
    ]);

    // Test: 複数の活動記録が同じタイプで絞り込まれる場合
    const moreRecords = [
      ...activityRecords,
      {
        id: '4',
        type: 'EMAIL',
        description: 'Sent follow-up email',
        createdAt: new Date('2024-01-20T11:00:00Z'),
      },
    ];
    const multiResult = filterActivityRecordsByType(
      moreRecords,
      'EMAIL',
      validTypes
    );
    expect(multiResult.length).toBe(2);
    expect(multiResult[0].id).toBe('4');
    expect(multiResult[1].id).toBe('1');

    // Test: 空の活動記録リストで絞り込むと空配列が返される
    const emptyResult = filterActivityRecordsByType([], 'EMAIL', validTypes);
    expect(emptyResult).toEqual([]);

    // Test: null または undefined のタイプで絞り込むとエラーが発生する
    expect(() =>
      filterActivityRecordsByType(activityRecords, null as any, validTypes)
    ).toThrow(/タイプ/);

    expect(() =>
      filterActivityRecordsByType(activityRecords, undefined as any, validTypes)
    ).toThrow(/タイプ/);

    // Test: 空文字列のタイプで絞り込むとエラーが発生する
    expect(() =>
      filterActivityRecordsByType(activityRecords, '', validTypes)
    ).toThrow(/タイプ/);
  });
});