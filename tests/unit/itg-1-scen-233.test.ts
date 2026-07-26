import { calculateROI } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-233
  test("ライセンス費用対効果分析機能 - 自社システム運用コストがSalesforceライセンス費用を上回る場合、負のROIが正しく計算される", () => {
    const salesforceMonthlyCost = 300000; // 月額30万円
    const customSystemMonthlyCost = 500000; // 月額50万円
    const analysisMonths = 12;

    const result = calculateROI({
      salesforceLicenseCost: salesforceMonthlyCost,
      customSystemOperationCost: customSystemMonthlyCost,
      analysisPeriodMonths: analysisMonths,
    });

    // ROI = (Salesforceライセンス費用 - 自社システム運用コスト) / 自社システム運用コスト × 100
    // ROI = (300000 - 500000) / 500000 × 100 = -200000 / 500000 × 100 = -40
    const expectedROI = -40;

    expect(result.roiPercentage).toBe(expectedROI);
    expect(result.isNegativeROI).toBe(true);
    expect(result.warningMessage).toMatch(/負のROI|削減効果がない|コスト超過/);

    // 年間コスト比較の検証
    const salesforceAnnualCost = salesforceMonthlyCost * analysisMonths; // 360万円
    const customSystemAnnualCost = customSystemMonthlyCost * analysisMonths; // 600万円

    expect(result.salesforceTotalCost).toBe(salesforceAnnualCost);
    expect(result.customSystemTotalCost).toBe(customSystemAnnualCost);

    // コスト差分が負（自社システムが高い）ことを確認
    const costDifference = salesforceAnnualCost - customSystemAnnualCost; // -240万円
    expect(costDifference).toBe(-2400000);
    expect(result.costDifference).toBe(costDifference);
  });
});