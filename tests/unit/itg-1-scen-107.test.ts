import { checkMonthlyReportDeadline } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-107
  test('月次報告期限が設定されていない場合にエラーが発生する', () => {
    const systemConfig = {
      monthlyReportDeadline: null,
    };

    expect(() => {
      checkMonthlyReportDeadline(systemConfig);
    }).toThrow(/月次報告期限/);
  });
});