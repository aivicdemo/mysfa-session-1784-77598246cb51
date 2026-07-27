import { filterActivityRecordsByDate } from '../../src/logic/it-1';

describe('顧客レコード画面の活動記録フィルタリング機能', () => {
  // SCEN-427
  test('活動記録フィルタが日付フォーマット不正な値を入力された場合、エラーがスローされる', () => {
    const invalid_activity_records = [
      {
        id: 'activity_001',
        type: 'email',
        date: '2024-01-15',
        description: 'Initial contact',
      },
      {
        id: 'activity_002',
        type: 'phone',
        date: '2024-01-20',
        description: 'Follow-up call',
      },
    ];

    const invalid_date_input = '2024-13-45';

    expect(() => {
      filterActivityRecordsByDate(invalid_activity_records, invalid_date_input);
    }).toThrow(/日付フォーマット/);
  });
});