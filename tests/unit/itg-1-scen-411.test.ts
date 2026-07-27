import { filterActivityRecordsByType } from '../../src/logic/it-1';

describe('顧客レコード画面の活動記録フィルタリング', () => {
  // SCEN-411
  test('フィルタ適用前に活動記録が複数件存在し、選択タイプと一致する場合、一致する全件が返される', () => {
    const activity_records = [
      {
        id: '1',
        type: '電話',
        date: new Date('2024-01-10T00:00:00Z'),
        customer_name: 'A社',
      },
      {
        id: '2',
        type: '訪問',
        date: new Date('2024-01-11T00:00:00Z'),
        customer_name: 'B社',
      },
      {
        id: '3',
        type: '電話',
        date: new Date('2024-01-12T00:00:00Z'),
        customer_name: 'C社',
      },
      {
        id: '4',
        type: 'メール',
        date: new Date('2024-01-13T00:00:00Z'),
        customer_name: 'D社',
      },
    ];

    const filter_type = '電話';

    const result = filterActivityRecordsByType(activity_records, filter_type);

    expect(result).toEqual([
      {
        id: '1',
        type: '電話',
        date: new Date('2024-01-10T00:00:00Z'),
        customer_name: 'A社',
      },
      {
        id: '3',
        type: '電話',
        date: new Date('2024-01-12T00:00:00Z'),
        customer_name: 'C社',
      },
    ]);
    expect(result.length).toBe(2);
  });
});