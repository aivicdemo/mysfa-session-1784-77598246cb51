import { extractActivityRecordsByPeriod } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-119
  test('月次報告期限・データ抽出処理 - 抽出対象期間内に記録された活動記録複数件の場合、全件が返される', () => {
    const extractionPeriodStart = new Date('2024-01-01T00:00:00Z');
    const extractionPeriodEnd = new Date('2024-01-31T23:59:59Z');

    const activityRecord1 = {
      activityId: 'ACT001',
      dateTime: new Date('2024-01-05T09:00:00Z'),
      type: '顧客訪問',
      assignedSalesPersonName: '営業太郎',
    };

    const activityRecord2 = {
      activityId: 'ACT002',
      dateTime: new Date('2024-01-15T14:30:00Z'),
      type: '電話商談',
      assignedSalesPersonName: '営業花子',
    };

    const activityRecord3 = {
      activityId: 'ACT003',
      dateTime: new Date('2024-01-28T11:00:00Z'),
      type: 'メール送信',
      assignedSalesPersonName: '営業太郎',
    };

    const mockActivityRecords = [activityRecord1, activityRecord2, activityRecord3];

    const result = extractActivityRecordsByPeriod(
      mockActivityRecords,
      extractionPeriodStart,
      extractionPeriodEnd
    );

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      activityId: 'ACT001',
      dateTime: new Date('2024-01-05T09:00:00Z'),
      type: '顧客訪問',
      assignedSalesPersonName: '営業太郎',
    });
    expect(result[1]).toEqual({
      activityId: 'ACT002',
      dateTime: new Date('2024-01-15T14:30:00Z'),
      type: '電話商談',
      assignedSalesPersonName: '営業花子',
    });
    expect(result[2]).toEqual({
      activityId: 'ACT003',
      dateTime: new Date('2024-01-28T11:00:00Z'),
      type: 'メール送信',
      assignedSalesPersonName: '営業太郎',
    });
  });
});