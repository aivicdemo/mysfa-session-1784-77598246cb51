import { checkMonthlyReportingDeadline } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-107
  test('月次報告期限判定機能 - 現在日時が月次報告期限に到達している場合、期限到達フラグがtrueで返却される', () => {
    const current_date_time = new Date('2024-04-30T18:00:00Z');
    const monthly_reporting_deadline = new Date('2024-04-30T18:00:00Z');
    const user_id = 'USR-001';
    const system_timezone = 'Asia/Tokyo';

    const result = checkMonthlyReportingDeadline({
      current_date_time,
      monthly_reporting_deadline,
      user_id,
      system_timezone,
    });

    expect(result.deadline_reached).toBe(true);
    expect(result.user_id).toBe('USR-001');
    expect(result.current_date_time).toEqual(current_date_time);
    expect(result.monthly_reporting_deadline).toEqual(monthly_reporting_deadline);
    expect(typeof result.deadline_reached).toBe('boolean');
  });
});