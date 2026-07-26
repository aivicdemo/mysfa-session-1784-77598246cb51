import { calculateROIAndAnnualSavings } from "../../src/logic/common";

describe("共通", () => {
  // SCEN-290
  test("費用比較表・ROI算出機能 - 小数点以下を含む費用値で、ROI・年間削減額が正確に計算される", () => {
    const initialCost = 150000.75;
    const monthlyCost = 8500.50;
    const traditionalAnnualCost = 180000.25;
    const adoptionYears = 1;

    const result = calculateROIAndAnnualSavings({
      initialCost,
      monthlyCost,
      traditionalAnnualCost,
      adoptionYears,
    });

    const yearlyInitialCost = initialCost / adoptionYears;
    const annualCostWithNewSystem = yearlyInitialCost + monthlyCost * 12;
    const expectedAnnualSavings = traditionalAnnualCost - annualCostWithNewSystem;
    const expectedROI =
      ((expectedAnnualSavings - yearlyInitialCost) / yearlyInitialCost) * 100;

    expect(result.annualSavings).toBeCloseTo(expectedAnnualSavings, 2);
    expect(result.roi).toBeCloseTo(expectedROI, 2);

    expect(Math.abs(result.annualSavings - expectedAnnualSavings)).toBeLessThan(
      0.01
    );
    expect(Math.abs(result.roi - expectedROI)).toBeLessThan(0.01);

    expect(result.annualSavings).toBe(-79000.75);
    expect(result.roi).toBe(-152.45);
  });
});