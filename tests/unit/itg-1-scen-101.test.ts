import { extractMonthlyReportData } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-101
  test('月末日の前日時点では月次報告期限未到来として検出されない', () => {
    const mockCurrentDate = new Date('2024-01-30T23:59:59Z');
    const userId = 'user_001';
    const accessControl = true;

    const result = extractMonthlyReportData({
      userId,
      hasAccessControl: accessControl,
      currentDate: mockCurrentDate,
    });

    expect(result.reportDeadlineReached).toBe(false);
    expect(result.deadlineStatus).toBe('not_due');
    expect(result.deadlineWarningMessage).toBeNull();
  });
});