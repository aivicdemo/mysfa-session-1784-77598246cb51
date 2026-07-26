import { calculateROIDeviation } from "../../src/logic/it-1-br-1784969812908-1-1-1";

describe("Salesforceライセンス廃止後の削減効果検証機能", () => {
  // SCEN-058
  test("投資判断時のROI予想値と実績値の乖離が許容範囲内であることを検証", () => {
    // 投資判断時のROI予想値（見積もり）
    const projectedROI = 0.35; // 35%
    const projectedAnnualSavings = 1200000; // 年間削減額 120万円
    const projectedPaybackPeriod = 2.86; // 回収期間 2.86年

    // 廃止されたライセンスの削減効果実績値
    const actualAnnualSavings = 1188000; // 実績 118.8万円
    const actualPaybackPeriod = 2.94; // 実績 2.94年
    const actualROI = 0.33; // 実績 33%

    // ROI予想値と実績値の乖離率を計算
    const deviationResult = calculateROIDeviation({
      projectedROI,
      actualROI,
      projectedAnnualSavings,
      actualAnnualSavings,
      projectedPaybackPeriod,
      actualPaybackPeriod,
    });

    // 期待結果: 乖離率が許容範囲内（±10%以内）であることを検証
    expect(deviationResult.roiDeviation).toBeLessThanOrEqual(0.1);
    expect(deviationResult.roiDeviation).toBeGreaterThanOrEqual(-0.1);

    // 年間削減額の乖離率も許容範囲内であること
    expect(deviationResult.savingsDeviation).toBeLessThanOrEqual(0.1);
    expect(deviationResult.savingsDeviation).toBeGreaterThanOrEqual(-0.1);

    // 回収期間の乖離率も許容範囲内であること
    expect(deviationResult.paybackDeviationRate).toBeLessThanOrEqual(0.1);
    expect(deviationResult.paybackDeviationRate).toBeGreaterThanOrEqual(-0.1);

    // 具体的な乖離率の値を検証
    // ROI乖離: (0.33 - 0.35) / 0.35 = -0.0571... ≈ -5.71%
    expect(deviationResult.roiDeviation).toBeCloseTo(-0.0571, 3);

    // 年間削減額乖離: (1188000 - 1200000) / 1200000 = -0.01 = -1%
    expect(deviationResult.savingsDeviation).toBe(-0.01);

    // 回収期間乖離: (2.94 - 2.86) / 2.86 = 0.0279... ≈ 2.79%
    expect(deviationResult.paybackDeviationRate).toBeCloseTo(0.0279, 3);

    // 総合判定：すべての指標が許容範囲内であること
    expect(deviationResult.isWithinTolerance).toBe(true);

    // 複数のライセンス廃止案件の検証：別案件
    const projectedROI2 = 0.42; // 42%
    const projectedAnnualSavings2 = 1500000; // 150万円
    const projectedPaybackPeriod2 = 2.38; // 2.38年

    const actualAnnualSavings2 = 1530000; // 実績 153万円
    const actualPaybackPeriod2 = 2.31; // 実績 2.31年
    const actualROI2 = 0.43; // 実績 43%

    const deviationResult2 = calculateROIDeviation({
      projectedROI: projectedROI2,
      actualROI: actualROI2,
      projectedAnnualSavings: projectedAnnualSavings2,
      actualAnnualSavings: actualAnnualSavings2,
      projectedPaybackPeriod: projectedPaybackPeriod2,
      actualPaybackPeriod: actualPaybackPeriod2,
    });

    // 第二案件も同じく許容範囲内
    expect(deviationResult2.roiDeviation).toBeLessThanOrEqual(0.1);
    expect(deviationResult2.roiDeviation).toBeGreaterThanOrEqual(-0.1);
    expect(deviationResult2.savingsDeviation).toBeLessThanOrEqual(0.1);
    expect(deviationResult2.savingsDeviation).toBeGreaterThanOrEqual(-0.1);
    expect(deviationResult2.paybackDeviationRate).toBeLessThanOrEqual(0.1);
    expect(deviationResult2.paybackDeviationRate).toBeGreaterThanOrEqual(-0.1);

    // ROI乖離: (0.43 - 0.42) / 0.42 = 0.0238... ≈ 2.38%
    expect(deviationResult2.roiDeviation).toBeCloseTo(0.0238, 3);

    // 年間削減額乖違: (1530000 - 1500000) / 1500000 = 0.02 = 2%
    expect(deviationResult2.savingsDeviation).toBe(0.02);

    // 回収期間乖離: (2.31 - 2.38) / 2.38 = -0.0294... ≈ -2.94%
    expect(deviationResult2.paybackDeviationRate).toBeCloseTo(-0.0294, 3);

    // 総合判定
    expect(deviationResult2.isWithinTolerance).toBe(true);

    // 乖離分析レポートの生成・確認
    expect(deviationResult).toHaveProperty("reportSummary");
    expect(deviationResult2).toHaveProperty("reportSummary");

    // レポートに案件の詳細情報が含まれることを確認
    expect(deviationResult.reportSummary).toContain("ROI");
    expect(deviationResult.reportSummary).toContain("削減額");
    expect(deviationResult.reportSummary).toContain("回収期間");

    // 許容範囲外の乖離がないことを確認
    expect(deviationResult.exceedsDeviation).toBe(false);
    expect(deviationResult2.exceedsDeviation).toBe(false);
  });
});