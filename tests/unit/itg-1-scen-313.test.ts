import { calculateROIProjection } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-313
  test("3年間のROI試算において初期構築コストと複数年度の運用コストを含めて投資回収期間が正確に算出される", () => {
    const initial_construction_cost = 5000000; // 500万円
    const year1_operation_cost = 2000000; // 年間200万円
    const year2_operation_cost = 2000000; // 年間200万円
    const year3_operation_cost = 2000000; // 年間200万円
    const annual_benefit_amount = 3000000; // 年間効果額300万円

    const result = calculateROIProjection({
      initial_construction_cost,
      year1_operation_cost,
      year2_operation_cost,
      year3_operation_cost,
      annual_benefit_amount,
    });

    // 総投資額: 初期構築500万 + 運用600万（200万×3年）= 1,100万円
    const total_investment = 11000000;

    // 投資回収期間: 1,100万 ÷ 300万/年 = 3.667年 = 44ヶ月
    const expected_payback_months = 44;

    // 投資回収期間の検証
    expect(result.payback_months).toBe(expected_payback_months);

    // 総投資額の検証
    expect(result.total_investment).toBe(total_investment);

    // 年間効果額の検証
    expect(result.annual_benefit).toBe(annual_benefit_amount);

    // 3年間の累積効果額: 300万 × 3年 = 900万円
    const three_year_cumulative_benefit = 9000000;
    expect(result.three_year_cumulative_benefit).toBe(
      three_year_cumulative_benefit
    );

    // 3年後の残り投資額: 1,100万 - 900万 = 200万円
    const remaining_investment_after_3years = 2000000;
    expect(result.remaining_investment_after_3years).toBe(
      remaining_investment_after_3years
    );

    // 内訳詳細の検証
    expect(result.breakdown.initial_construction_cost).toBe(
      initial_construction_cost
    );
    expect(result.breakdown.year1_operation_cost).toBe(year1_operation_cost);
    expect(result.breakdown.year2_operation_cost).toBe(year2_operation_cost);
    expect(result.breakdown.year3_operation_cost).toBe(year3_operation_cost);
    expect(result.breakdown.total_operation_cost).toBe(6000000); // 200万×3年

    // ROI（投資回収率）の検証: 3年間の累積効果 ÷ 総投資額
    // 900万 ÷ 1,100万 = 0.8181... ≈ 81.82%
    const expected_roi_3years = 81.82;
    expect(Math.round(result.roi_3years * 100) / 100).toBe(expected_roi_3years);

    // 年間削減額の検証
    expect(result.annual_savings).toBe(
      annual_benefit_amount - (year1_operation_cost / 12) * 12
    );
  });
});