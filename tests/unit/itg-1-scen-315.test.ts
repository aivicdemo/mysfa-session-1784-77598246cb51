import { calculateAnnualSavingsAndROI } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-315
  test("自社システム運用コストがSalesforceライセンス費用と同額の場合に年間削減額がゼロと算出される", () => {
    const inHouseSystemAnnualOperationCost = 1200000;
    const salesforceAnnualLicenseCost = 1200000;

    const result = calculateAnnualSavingsAndROI({
      inHouseSystemAnnualOperationCost,
      salesforceAnnualLicenseCost,
    });

    expect(result.annualSavings).toBe(0);
    expect(result.roiPercentage).toBe(0);
  });
});