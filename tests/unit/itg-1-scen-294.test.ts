import { calculateMultiYearROI } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-294
  test('年間保守コストが未入力の場合、計算処理が例外を発生させる', () => {
    const initialInvestment = 500000;
    const annualMaintenanceCost = null;
    const comparisonYears = 3;

    expect(() =>
      calculateMultiYearROI({
        initialInvestment,
        annualMaintenanceCost,
        comparisonYears,
      })
    ).toThrow(/年間保守コスト/);
  });
});