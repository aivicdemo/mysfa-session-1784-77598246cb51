import { calculateInitialConstructionCost, calculateAnnualMaintenanceCost } from '../../src/logic/common';

describe('共通 - 初期構築コスト・年間保守運用コスト算出機能', () => {
  // SCEN-277
  test('工数が0または負の値の場合、エラーが返される', () => {
    // 工数が0の場合
    expect(() => {
      calculateInitialConstructionCost({ man_hours: 0, hourly_rate: 5000 });
    }).toThrow(/工数/);

    // 工数が負の値（-10）の場合
    expect(() => {
      calculateInitialConstructionCost({ man_hours: -10, hourly_rate: 5000 });
    }).toThrow(/工数/);

    // 年間保守運用コスト算出でも同様
    expect(() => {
      calculateAnnualMaintenanceCost({ man_hours: 0, hourly_rate: 5000 });
    }).toThrow(/工数/);

    expect(() => {
      calculateAnnualMaintenanceCost({ man_hours: -10, hourly_rate: 5000 });
    }).toThrow(/工数/);

    // 正の値の場合は成功
    const initial_result = calculateInitialConstructionCost({ man_hours: 100, hourly_rate: 5000 });
    expect(initial_result).toBe(500000);

    const annual_result = calculateAnnualMaintenanceCost({ man_hours: 50, hourly_rate: 5000 });
    expect(annual_result).toBe(250000);
  });
});