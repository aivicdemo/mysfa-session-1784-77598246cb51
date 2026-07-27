import { filterActivityRecords } from '../../src/logic/it-1';

describe('顧客レコード画面の過去商談履歴・活動記録表示機能', () => {
  // SCEN-430
  test('活動記録フィルタリング機能 - 同じ入力で2回実行してもフィルタ結果が同じになる', () => {
    // 期待値の固定データセット
    const filterCondition = {
      activityType: '営業訪問',
      startDate: new Date('2024-01-01T00:00:00Z'),
      endDate: new Date('2024-01-31T23:59:59Z'),
      assignedSalesPersonName: '営業太郎'
    };

    const expectedRecordCount = 3;
    const expectedResult = [
      {
        id: 'ACT-001',
        date: new Date('2024-01-05T09:30:00Z'),
        activityContent: '客先A訪問',
        assignedSalesPerson: '営業太郎'
      },
      {
        id: 'ACT-005',
        date: new Date('2024-01-15T14:00:00Z'),
        activityContent: '客先B訪問',
        assignedSalesPerson: '営業太郎'
      },
      {
        id: 'ACT-008',
        date: new Date('2024-01-25T11:15:00Z'),
        activityContent: '客先C訪問',
        assignedSalesPerson: '営業太郎'
      }
    ];

    // 1回目のフィルタ実行
    const result_1 = filterActivityRecords(filterCondition);

    // 2回目のフィルタ実行（同一条件）
    const result_2 = filterActivityRecords(filterCondition);

    // Result_1とResult_2のレコード件数が同じことを確認
    expect(result_1.records.length).toBe(expectedRecordCount);
    expect(result_2.records.length).toBe(expectedRecordCount);
    expect(result_2.records.length).toBe(result_1.records.length);

    // Result_1とResult_2の全レコードについて、ID・日付・活動内容・担当者が完全に一致することを確認
    for (let i = 0; i < expectedRecordCount; i++) {
      expect(result_2.records[i].id).toBe(result_1.records[i].id);
      expect(result_2.records[i].id).toBe(expectedResult[i].id);

      expect(result_2.records[i].date).toEqual(result_1.records[i].date);
      expect(result_2.records[i].date).toEqual(expectedResult[i].date);

      expect(result_2.records[i].activityContent).toBe(result_1.records[i].activityContent);
      expect(result_2.records[i].activityContent).toBe(expectedResult[i].activityContent);

      expect(result_2.records[i].assignedSalesPerson).toBe(result_1.records[i].assignedSalesPerson);
      expect(result_2.records[i].assignedSalesPerson).toBe(expectedResult[i].assignedSalesPerson);
    }

    // 表示順序が同じであることを確認（両結果の各レコードが同じ順序で並んでいる）
    expect(result_2.records).toEqual(result_1.records);
  });
});