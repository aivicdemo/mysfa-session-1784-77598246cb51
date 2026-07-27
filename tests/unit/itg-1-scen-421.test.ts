import { filterActivityRecords } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-421
  test('活動記録フィルタリング機能 - フィルタ対象の活動記録に重複データが含まれる場合、重複したまますべてが返される', () => {
    const record1 = {
      activityId: 'ACT001',
      salesPersonName: '田中',
      activityType: '訪問',
      date: '2024-01-15',
      customerId: 'CUST001',
      memo: 'クライアント訪問',
    };

    const record2 = {
      activityId: 'ACT001',
      salesPersonName: '田中',
      activityType: '訪問',
      date: '2024-01-15',
      customerId: 'CUST001',
      memo: 'クライアント訪問',
    };

    const record3 = {
      activityId: 'ACT002',
      salesPersonName: '佐藤',
      activityType: '電話',
      date: '2024-01-16',
      customerId: 'CUST001',
      memo: '電話フォロー',
    };

    const activities = [record1, record2, record3];
    const filterCondition = { salesPersonName: '田中' };

    const result = filterActivityRecords(activities, filterCondition);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(record1);
    expect(result[1]).toEqual(record2);
    expect(result[0]).toEqual(result[1]);
  });
});