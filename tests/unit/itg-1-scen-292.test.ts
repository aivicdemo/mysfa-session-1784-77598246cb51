import { calculateMultiYearCostComparison } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-292: [normal] 複数年度コスト比較・ROI計算機能 - 年度ごとの削減額とROI（投資回収率）が正確に算出される
  test('should calculate multi-year cost comparison with accurate ROI and cumulative savings', () => {
    const initial_investment_amount = 1000000; // 100万円
    const year1_savings = 300000; // 30万円
    const year2_savings = 400000; // 40万円
    const year3_savings = 500000; // 50万円

    const result = calculateMultiYearCostComparison({
      initialInvestmentAmount: initial_investment_amount,
      yearlySavings: [year1_savings, year2_savings, year3_savings],
    });

    // 1年目の削減額が正確に表示される
    expect(result.yearlySavings[0]).toBe(300000);

    // 2年目の削減額が正確に表示される
    expect(result.yearlySavings[1]).toBe(400000);

    // 3年目の削減額が正確に表示される
    expect(result.yearlySavings[2]).toBe(500000);

    // 1年目のROIが30%で正確に算出される
    // ROI = (年間削減額 / 初期投資額) * 100
    // 1年目ROI = (300000 / 1000000) * 100 = 30%
    expect(result.yearlyROI[0]).toBe(30.0);

    // 2年目のROIが70%で正確に算出される
    // 2年目ROI = (累積削減額 / 初期投資額) * 100 = (700000 / 1000000) * 100 = 70%
    expect(result.yearlyROI[1]).toBe(70.0);

    // 3年目のROIが120%で正確に算出される
    // 3年目ROI = (累積削減額 / 初期投資額) * 100 = (1200000 / 1000000) * 100 = 120%
    expect(result.yearlyROI[2]).toBe(120.0);

    // 1年目の累積削減額が30万円と段階的に表示される
    expect(result.cumulativeSavings[0]).toBe(300000);

    // 2年目の累積削減額が70万円と段階的に表示される
    // 累積削減額 = 30万 + 40万 = 70万
    expect(result.cumulativeSavings[1]).toBe(700000);

    // 3年目の累積削減額が120万円と段階的に表示される
    // 累積削減額 = 30万 + 40万 + 50万 = 120万
    expect(result.cumulativeSavings[2]).toBe(1200000);

    // 投資回収期間が2年目に投資額を回収することが示される
    // 1年目: 30万 < 100万 (未回収)
    // 2年目: 70万 < 100万 (未回収)
    // 3年目: 120万 > 100万 (回収)
    // ただし、投資回収は2年目と3年目の間で達成される
    // 正確な投資回収期間 = 2 + (1000000 - 700000) / 500000 = 2.6年
    expect(result.paybackPeriod).toBe(2.6);

    // すべての計算結果が小数点第2位まで正確に表示される
    expect(result.yearlyROI[0]).toBeCloseTo(30.0, 2);
    expect(result.yearlyROI[1]).toBeCloseTo(70.0, 2);
    expect(result.yearlyROI[2]).toBeCloseTo(120.0, 2);
    expect(result.paybackPeriod).toBeCloseTo(2.6, 2);
  });
});