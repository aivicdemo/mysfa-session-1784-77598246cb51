import { calculateInvestmentDecision } from "../../src/logic/it-1-br-1784969812908-1-1-1";

describe("Salesforce ライセンス利用状況の可視化機能", () => {
  test("SCEN-046: ROI閾値未満の削減効果の場合、投資判断が却下される", () => {
    const salesforceLicenseCostPerYear = 500000;
    const developmentInitialCost = 2000000;
    const maintenanceCostPerYear = 150000;
    const roi_threshold = 0.25;
    const years = 3;

    const salesforceCumulativeCost = salesforceLicenseCostPerYear * years;
    const developmentCumulativeCost = developmentInitialCost + (maintenanceCostPerYear * years);

    const netSavings = salesforceCumulativeCost - developmentCumulativeCost;
    const roi = netSavings / developmentInitialCost;

    const input = {
      salesforceLicenseCostPerYear,
      developmentInitialCost,
      maintenanceCostPerYear,
      roiThreshold: roi_threshold,
      analysisYears: years,
    };

    const result = calculateInvestmentDecision(input);

    expect(result.isApproved).toBe(false);
    expect(result.roi).toBe(-0.025);
    expect(result.roiThreshold).toBe(0.25);
    expect(result.roiThreshold).toBeGreaterThan(result.roi);
    expect(result.rejectionReason).toMatch(/ROI/);
    expect(result.rejectionReason).toMatch(/閾値/);
    expect(result.salesforceCumulativeCost).toBe(1500000);
    expect(result.developmentCumulativeCost).toBe(2450000);
    expect(result.annualSavings).toBe(-316666.67);
    expect(result.decisionStatus).toBe("REJECTED");
    expect(result.recordId).toBeDefined();
    expect(typeof result.recordId).toBe("string");
    expect(result.recordId.length).toBeGreaterThan(0);
    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });
});