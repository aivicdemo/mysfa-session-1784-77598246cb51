import { calculateAnnualSavings } from '../../src/logic/common';

describe('共通', () => {
  // SCEN-286
  test('費用比較表・ROI算出機能 - 年間削減額が初期構築コスト・年間保守運用コスト・ライセンス費用の差分から正確に算出される', () => {
    const proposed_initial_cost = 1000000;
    const proposed_annual_maintenance = 200000;
    const proposed_license_fee = 150000;
    const current_initial_cost = 800000;
    const current_annual_maintenance = 300000;
    const current_license_fee = 100000;

    const annual_savings = calculateAnnualSavings({
      proposed_initial_cost,
      proposed_annual_maintenance,
      proposed_license_fee,
      current_initial_cost,
      current_annual_maintenance,
      current_license_fee,
    });

    const expected_annual_savings = (current_annual_maintenance + current_license_fee) - (proposed_annual_maintenance + proposed_license_fee);

    expect(annual_savings).toBe(50000);
    expect(annual_savings).toBe(expected_annual_savings);
  });
});