import { checkMonthlyReportDeadline } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-108
  test('月次報告期限判定機能 - 現在日時が月次報告期限に到達していない場合、期限到達フラグがfalseで返却される', () => {
    const deadline = new Date('2024-01-31T23:59:59Z');
    const currentTime = new Date('2024-01-31T23:59:58Z');

    const result = checkMonthlyReportDeadline({
      deadline,
      currentTime,
    });

    expect(result).toEqual({
      isDeadlineReached: false,
    });
    expect(result.isDeadlineReached).toBe(false);
  });
});