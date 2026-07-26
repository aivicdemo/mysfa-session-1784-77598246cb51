import { checkMonthlyReportingDeadline } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 月次報告期限チェック機能', () => {
  // SCEN-041
  test('現在日時が月次報告期限に達した場合、期限到達と判定される', () => {
    const deadline_datetime = new Date('2024-01-31T23:59:59Z');
    const current_datetime = new Date('2024-01-31T23:59:59Z');

    const result = checkMonthlyReportingDeadline({
      deadline_datetime,
      current_datetime,
    });

    expect(result.is_deadline_reached).toBe(true);
    expect(result.deadline_notification_message).toBe('期限到達');
  });
});