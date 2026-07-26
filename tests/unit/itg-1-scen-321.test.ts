import { calculateROIPaybackPeriod } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-321: [edge] ROI試算・投資判断支援機能 - 投資回収期間が1年未満の場合に月単位で正確に計算される
  test("投資回収期間が1年未満のケースで月単位で正確に計算される", () => {
    // Pattern 1: 投資額1,000,000円、月次利益200,000円 → 5ヶ月
    const pattern1_result = calculateROIPaybackPeriod({
      investment_amount: 1000000,
      monthly_profit: 200000,
    });
    expect(pattern1_result.payback_period_months).toBe(5);
    expect(pattern1_result.payback_period_years).toBe(0);
    expect(pattern1_result.is_within_one_year).toBe(true);

    // Pattern 2: 投資額500,000円、月次利益150,000円 → 3.33ヶ月（切上げ）
    const pattern2_result = calculateROIPaybackPeriod({
      investment_amount: 500000,
      monthly_profit: 150000,
    });
    expect(pattern2_result.payback_period_months).toBeCloseTo(3.33, 2);
    expect(pattern2_result.payback_period_years).toBe(0);
    expect(pattern2_result.is_within_one_year).toBe(true);

    // Pattern 3: 投資額2,000,000円、月次利益300,000円 → 6.67ヶ月
    const pattern3_result = calculateROIPaybackPeriod({
      investment_amount: 2000000,
      monthly_profit: 300000,
    });
    expect(pattern3_result.payback_period_months).toBeCloseTo(6.67, 2);
    expect(pattern3_result.payback_period_years).toBe(0);
    expect(pattern3_result.is_within_one_year).toBe(true);

    // Pattern 4: 投資額3,000,000円、月次利益250,000円 → 12ヶ月（丁度1年）
    const pattern4_result = calculateROIPaybackPeriod({
      investment_amount: 3000000,
      monthly_profit: 250000,
    });
    expect(pattern4_result.payback_period_months).toBe(12);
    expect(pattern4_result.payback_period_years).toBe(1);
    expect(pattern4_result.is_within_one_year).toBe(false);

    // Pattern 5: 投資額1,500,000円、月次利益400,000円 → 3.75ヶ月
    const pattern5_result = calculateROIPaybackPeriod({
      investment_amount: 1500000,
      monthly_profit: 400000,
    });
    expect(pattern5_result.payback_period_months).toBeCloseTo(3.75, 2);
    expect(pattern5_result.payback_period_years).toBe(0);
    expect(pattern5_result.is_within_one_year).toBe(true);

    // Pattern 6: 投資額750,000円、月次利益100,000円 → 7.5ヶ月
    const pattern6_result = calculateROIPaybackPeriod({
      investment_amount: 750000,
      monthly_profit: 100000,
    });
    expect(pattern6_result.payback_period_months).toBeCloseTo(7.5, 2);
    expect(pattern6_result.payback_period_years).toBe(0);
    expect(pattern6_result.is_within_one_year).toBe(true);

    // エラーケース: 月次利益が0以下
    expect(() =>
      calculateROIPaybackPeriod({
        investment_amount: 1000000,
        monthly_profit: 0,
      })
    ).toThrow(/利益/);

    // エラーケース: 月次利益が負数
    expect(() =>
      calculateROIPaybackPeriod({
        investment_amount: 1000000,
        monthly_profit: -100000,
      })
    ).toThrow(/利益/);

    // エラーケース: 投資額が0以下
    expect(() =>
      calculateROIPaybackPeriod({
        investment_amount: 0,
        monthly_profit: 200000,
      })
    ).toThrow(/投資/);

    // エラーケース: 投資額が負数
    expect(() =>
      calculateROIPaybackPeriod({
        investment_amount: -1000000,
        monthly_profit: 200000,
      })
    ).toThrow(/投資/);
  });
});