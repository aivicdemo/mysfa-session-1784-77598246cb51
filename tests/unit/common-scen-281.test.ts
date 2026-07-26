import { calculateAnnualMaintenanceCost } from '../../src/logic/common';

describe('共通', () => {
  // SCEN-281
  test('年間保守運用コスト算出機能 - 人月単価が0以下の場合、エラーが返される', () => {
    const validMonthlyPersonCount = 2;
    const validAnnualMonths = 12;

    // 人月単価が0の場合
    expect(() => {
      calculateAnnualMaintenanceCost({
        unitPricePerPersonMonth: 0,
        monthlyPersonCount: validMonthlyPersonCount,
        annualMonths: validAnnualMonths,
      });
    }).toThrow(/人月単価/);

    // 人月単価が負の値の場合
    expect(() => {
      calculateAnnualMaintenanceCost({
        unitPricePerPersonMonth: -1000,
        monthlyPersonCount: validMonthlyPersonCount,
        annualMonths: validAnnualMonths,
      });
    }).toThrow(/人月単価/);

    // 人月単価が正の値の場合は正常に計算される
    const result = calculateAnnualMaintenanceCost({
      unitPricePerPersonMonth: 100000,
      monthlyPersonCount: validMonthlyPersonCount,
      annualMonths: validAnnualMonths,
    });
    expect(result).toBe(2400000);
  });
});