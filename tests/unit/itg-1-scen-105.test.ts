import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { checkMonthlyReportDeadline } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-105
  test('月次報告期限判定機能 - 現在日時が月次報告期限に到達した場合に期限到達フラグがtrueとなる', () => {
    const now_date_str = '2024-04-15T23:59:59Z';
    const deadline_date_str = '2024-04-15T23:59:59Z';
    const now_date = new Date(now_date_str);
    const deadline_date = new Date(deadline_date_str);

    jest.useFakeTimers();
    jest.setSystemTime(now_date);

    const result = checkMonthlyReportDeadline(deadline_date);

    expect(result).toBe(true);

    jest.useRealTimers();
  });
});