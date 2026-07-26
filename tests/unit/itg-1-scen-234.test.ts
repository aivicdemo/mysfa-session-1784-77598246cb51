import { calculateInvestmentRecoveryPeriod } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-234
  test('運用期間が1ヶ月未満の場合、投資回収期間の算出エラーが返される', () => {
    const operationDays = 15;
    const salesforceLicenseCost = 300000;
    const monthlySavingsAmount = 50000;

    expect(() => {
      calculateInvestmentRecoveryPeriod({
        operationDays,
        salesforceLicenseCost,
        monthlySavingsAmount,
      });
    }).toThrow(/運用期間/);
  });
});