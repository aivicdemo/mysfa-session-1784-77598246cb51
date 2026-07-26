import { isMonthlyReportDeadlineReached } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-110
  test('月次報告期限判定機能 - 現在日時がちょうど月次報告期限の時刻である場合、期限到達と判定される', () => {
    const deadline = new Date('2024-04-30T17:00:00Z');
    const currentDateTime = new Date('2024-04-30T17:00:00Z');

    const result = isMonthlyReportDeadlineReached({
      deadline,
      currentDateTime,
    });

    expect(result).toEqual({
      isDeadlineReached: true,
      status: '期限到達',
    });
  });
});