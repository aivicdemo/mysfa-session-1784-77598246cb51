import { calculateROIAndPaybackPeriod } from "../../src/logic/it-1-br-1784969812908-1-1-1";

describe("Salesforceライセンス利用状況の可視化機能", () => {
  // SCEN-060: [edge] Salesforceライセンス廃止後の削減効果検証機能 - 投資回収期間が0ヶ月の場合、即座のROI実現と判定される
  test("should determine immediate ROI achievement when payback period is 0 months", () => {
    const discontinuationDate = new Date("2024-01-15T00:00:00Z");
    const licenseCountToDiscontinue = 5;
    const monthlyLicenseCostBeforeDiscontinuation = 50000;
    const initialSystemBuildingCost = 0;
    const annualSystemMaintenanceCost = 0;

    const result = calculateROIAndPaybackPeriod({
      discontinuationDate,
      licenseCountToDiscontinue,
      monthlyLicenseCostBeforeDiscontinuation,
      initialSystemBuildingCost,
      annualSystemMaintenanceCost,
    });

    expect(result.paybackPeriodMonths).toBe(0);
    expect(result.roiStatus).toBe("即時達成");
    expect(result.roiRealizationDate).toEqual(discontinuationDate);
    expect(result.isImmediateROIAchievement).toBe(true);
    expect(result.monthlyMoneySavings).toBe(50000);
  });
});