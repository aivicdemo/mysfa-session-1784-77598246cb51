import { extractMonthlyReportData } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  test('SCEN-118: 月次報告期限・データ抽出処理 - 抽出対象期間内に記録された活動記録1件のみの場合、その1件が返される', () => {
    // Arrange: テスト用の活動記録データを準備
    const activityRecordInRange = {
      salesperson_id: '001',
      customer_id: 'C001',
      activity_type: '商談',
      activity_content: '提案資料提示',
      executed_at: new Date('2024-01-15T14:30:00Z'),
    };

    const activityRecordOutOfRange = {
      salesperson_id: '002',
      customer_id: 'C002',
      activity_type: '電話',
      activity_content: '初回ヒアリング',
      executed_at: new Date('2023-12-31T10:00:00Z'),
    };

    const extractionPeriodStart = new Date('2024-01-01T00:00:00Z');
    const extractionPeriodEnd = new Date('2024-01-31T23:59:59Z');
    const monthlyDeadline = new Date('2024-01-31T23:59:59Z');

    // Act: 月次報告期限データ抽出処理を実行
    const result = extractMonthlyReportData(
      [activityRecordInRange, activityRecordOutOfRange],
      extractionPeriodStart,
      extractionPeriodEnd,
      monthlyDeadline
    );

    // Assert: 抽出結果が期待通りであることを検証
    expect(result).toEqual({
      count: 1,
      activities: [
        {
          salesperson_id: '001',
          customer_id: 'C001',
          activity_type: '商談',
          activity_content: '提案資料提示',
          executed_at: new Date('2024-01-15T14:30:00Z'),
        },
      ],
    });
    expect(result.count).toBe(1);
    expect(result.activities.length).toBe(1);
    expect(result.activities[0].salesperson_id).toBe('001');
    expect(result.activities[0].customer_id).toBe('C001');
    expect(result.activities[0].activity_type).toBe('商談');
    expect(result.activities[0].activity_content).toBe('提案資料提示');
    expect(result.activities[0].executed_at).toEqual(
      new Date('2024-01-15T14:30:00Z')
    );
  });
});