import { checkMonthlyReportDeadline } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 商談情報参照機能', () => {
  // SCEN-044
  test('月次報告期限チェック機能 - 現在日時が月次報告期限と完全に一致する場合、期限到達と判定される', () => {
    const deadline = new Date('2024-01-31T23:59:59Z');
    const currentTime = new Date('2024-01-31T23:59:59Z');

    const result = checkMonthlyReportDeadline({
      currentTime,
      deadline,
    });

    expect(result.isDeadlineReached).toBe(true);
    expect(result.status).toBe('到達');
  });
});