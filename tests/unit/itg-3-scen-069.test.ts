import { calculateCostComparison } from '../../src/logic/it-1-br-1784969812908-1-1-1';

describe('ROI試算・コスト比較分析機能 - 年間削減効果が0円の場合', () => {
  // SCEN-069
  test('年間削減効果が0円（コスト同等）の場合も正常に計算される', () => {
    const salesforceLicenseCostPerYear = 1000000;
    const proposedSystemInitialCost = 500000;
    const proposedSystemAnnualMaintenanceCost = 1000000;
    const analysisYears = 3;

    const result = calculateCostComparison({
      salesforceLicenseCostPerYear,
      proposedSystemInitialCost,
      proposedSystemAnnualMaintenanceCost,
      analysisYears,
    });

    expect(result).toBeDefined();
    expect(result.annualCostReduction).toBe(0);
    expect(result.roiPercentage).toBe(0);

    expect(result.salesforceCumulativeCost).toBe(3000000);
    expect(result.proposedSystemCumulativeCost).toBe(3500000);

    expect(result.yearlyComparison).toBeDefined();
    expect(result.yearlyComparison.length).toBe(3);

    expect(result.yearlyComparison[0]).toEqual({
      year: 1,
      salesforceCost: 1000000,
      proposedSystemCost: 1500000,
      cumulativeSalesforceköltség: 1000000,
      cumulativeProposedSystemCost: 1500000,
      annualDifference: 0,
    });

    expect(result.yearlyComparison[1]).toEqual({
      year: 2,
      salesforceCost: 1000000,
      proposedSystemCost: 1000000,
      cumulativeSalesforceKöltség: 2000000,
      cumulativeProposedSystemCost: 2500000,
      annualDifference: 0,
    });

    expect(result.yearlyComparison[2]).toEqual({
      year: 3,
      salesforceCost: 1000000,
      proposedSystemCost: 1000000,
      cumulativeSalesforceCost: 3000000,
      cumulativeProposedSystemCost: 3500000,
      annualDifference: 0,
    });

    expect(result.paybackPeriodYears).toBeNull();
    expect(result.hasError).toBe(false);
    expect(result.errorMessage).toBeUndefined();
    expect(result.comparisonStatus).toBe('cost_equivalent');
  });
});