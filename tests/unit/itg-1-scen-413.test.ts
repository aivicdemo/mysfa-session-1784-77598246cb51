import { filterActivityRecordsByType } from '../../src/logic/it-1';

describe('顧客レコード画面の活動記録フィルタリング', () => {
  // SCEN-413
  test('複数件の活動記録が存在し、選択タイプと一致する件数が1件の場合、1件が返される', () => {
    const activityRecords = [
      {
        id: 'activity_a',
        type: '電話',
        date: new Date('2024-01-15T10:00:00Z'),
        description: '顧客との電話打ち合わせ',
      },
      {
        id: 'activity_b',
        type: 'メール',
        date: new Date('2024-01-14T09:00:00Z'),
        description: '提案資料送付',
      },
      {
        id: 'activity_c',
        type: '訪問',
        date: new Date('2024-01-13T14:00:00Z'),
        description: '顧客訪問',
      },
      {
        id: 'activity_d',
        type: '電話',
        date: new Date('2024-01-12T11:00:00Z'),
        description: '状況確認電話',
      },
    ];

    const selectedType = '電話';
    const result = filterActivityRecordsByType(activityRecords, selectedType);

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('電話');
    expect(result[0].id).toBe('activity_a');
    expect(result[0].date).toEqual(new Date('2024-01-15T10:00:00Z'));
  });
});