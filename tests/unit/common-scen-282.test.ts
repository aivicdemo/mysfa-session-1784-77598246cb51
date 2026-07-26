import { calculateAnnualMaintenanceCost } from '../../src/logic/common';

describe('共通', () => {
  // SCEN-282
  test('[edge] 年間保守運用コスト算出機能 - 運用工数が0の場合、年間保守運用コストが0として計算される', () => {
    const operational_hours = 0;
    const hourly_rate = 5000;
    const maintenance_months = 12;

    const result = calculateAnnualMaintenanceCost({
      operational_hours,
      hourly_rate,
      maintenance_months,
    });

    expect(result).toBe(0);
  });
});