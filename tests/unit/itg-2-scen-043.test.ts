import { checkMonthlyReportDeadline } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 商談情報参照機能', () => {
  // SCEN-043
  test('[error] 月次報告期限チェック機能 - 月次報告期限設定が存在しない場合、エラーが発生する', () => {
    const loginUserId = 'user_portal_001';
    const systemCurrentDate = new Date('2024-01-15T09:00:00Z');

    expect(() =>
      checkMonthlyReportDeadline({
        loginUserId,
        systemCurrentDate,
        monthlyReportDeadlineSetting: null,
      })
    ).toThrow(/月次報告期限設定/);
  });
});