import { detectMonthlyReportingDeadline } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-100: [edge] 月次報告期限・データ抽出処理 - 月末日の翌月1日時点で月次報告期限到来が検出される
  test('月末日23:59:59では報告期限到来フラグがfalse、翌月1日00:00:00で到来フラグがtrue遷移し、当月分がデータ抽出対象キューに登録される', () => {
    const lastDayOfMonthDate = new Date('2024-01-31T23:59:59Z');
    const firstDayOfNextMonthDate = new Date('2024-02-01T00:00:00Z');

    const resultAtLastDayOfMonth = detectMonthlyReportingDeadline(lastDayOfMonthDate);
    expect(resultAtLastDayOfMonth.deadlineReached).toBe(false);
    expect(resultAtLastDayOfMonth.extractionQueueRegistered).toBe(false);

    const resultAtFirstDayOfNextMonth = detectMonthlyReportingDeadline(firstDayOfNextMonthDate);
    expect(resultAtFirstDayOfNextMonth.deadlineReached).toBe(true);
    expect(resultAtFirstDayOfNextMonth.extractionQueueRegistered).toBe(true);
    expect(resultAtFirstDayOfNextMonth.targetMonthForExtraction).toEqual('2024-01');
    expect(resultAtFirstDayOfNextMonth.scheduledExtractionDateTime).toEqual('2024-02-01T00:00:00Z');
  });
});