import { calculateROI } from "../../src/logic/common";

describe("共通", () => {
  // SCEN-284
  test("[normal] 費用比較表・ROI算出機能 - 初期構築コスト・年間保守運用コスト・ライセンス費用から3年間のROIが正確に算出される", () => {
    const initial_construction_cost = 1000000;
    const annual_maintenance_cost = 500000;
    const annual_license_cost = 300000;
    const calculation_period_years = 3;

    const result = calculateROI({
      initial_construction_cost,
      annual_maintenance_cost,
      annual_license_cost,
      calculation_period_years,
    });

    expect(result.total_cost_3_years).toBe(27400000);
    expect(typeof result.roi_value).toBe("number");
    expect(result.roi_value).toBeGreaterThanOrEqual(0);
    expect(typeof result.payback_period_months).toBe("number");
    expect(result.payback_period_months).toBeGreaterThanOrEqual(0);
  });
});