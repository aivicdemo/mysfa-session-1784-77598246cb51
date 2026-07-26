import { generateCostComparisonTable } from '../../src/logic/it-1-br-1784969812908-1-1-1';

describe('Salesforce ライセンス利用状況の可視化機能', () => {
  // SCEN-036
  test('コスト比較表生成機能 - 初期構築・年間保守・ライセンス費用から3年間ROIが正確に算出される', () => {
    const initialConstructionCost = 500000;
    const annualMaintenanceCost = 100000;
    const annualLicenseCost = 200000;

    const result = generateCostComparisonTable({
      initialConstructionCost,
      annualMaintenanceCost,
      annualLicenseCost,
    });

    // Year 1: 500,000 + 100,000 + 200,000 = 800,000
    expect(result.year1TotalCost).toBe(800000);

    // Year 2: 100,000 + 200,000 = 300,000
    expect(result.year2TotalCost).toBe(300000);

    // Year 3: 100,000 + 200,000 = 300,000
    expect(result.year3TotalCost).toBe(300000);

    // 3-year cumulative cost: 800,000 + 300,000 + 300,000 = 1,400,000
    expect(result.cumulativeCostThreeYears).toBe(1400000);

    // Salesforce cumulative cost (3 years of license only): 200,000 * 3 = 600,000
    const salesforceCumulativeCost = annualLicenseCost * 3;
    expect(result.salesforceCumulativeCost).toBe(600000);

    // Cost savings: 1,400,000 - 600,000 = 800,000
    const costSavings = result.cumulativeCostThreeYears - salesforceCumulativeCost;
    expect(costSavings).toBe(800000);

    // ROI calculation: (cost savings / initial investment) * 100
    // Initial investment = 500,000 + (100,000 * 3) = 800,000
    const initialInvestment = initialConstructionCost + annualMaintenanceCost * 3;
    const expectedROI = (costSavings / initialInvestment) * 100;
    expect(result.roiPercentage).toBe(expectedROI);
    expect(result.roiPercentage).toBe(100);

    // Graph data structure validation
    expect(result.graphData).toBeDefined();
    expect(Array.isArray(result.graphData)).toBe(true);
    expect(result.graphData.length).toBe(3);

    // Year 1 graph data
    expect(result.graphData[0]).toEqual({
      year: 1,
      systemCost: 800000,
      salesforceCost: 200000,
      cumulativeSystemCost: 800000,
      cumulativeSalesforceCost: 200000,
    });

    // Year 2 graph data
    expect(result.graphData[1]).toEqual({
      year: 2,
      systemCost: 300000,
      salesforceCost: 200000,
      cumulativeSystemCost: 1100000,
      cumulativeSalesforceCost: 400000,
    });

    // Year 3 graph data
    expect(result.graphData[2]).toEqual({
      year: 3,
      systemCost: 300000,
      salesforceCost: 200000,
      cumulativeSystemCost: 1400000,
      cumulativeSalesforceCost: 600000,
    });

    // Verify cost comparison table structure
    expect(result.comparisonTable).toBeDefined();
    expect(result.comparisonTable).toEqual({
      initialConstructionCost: 500000,
      annualMaintenanceCost: 100000,
      annualLicenseCost: 200000,
      year1SystemTotal: 800000,
      year2SystemTotal: 300000,
      year3SystemTotal: 300000,
      threeYearSystemTotal: 1400000,
      threeYearSalesforceTotal: 600000,
      annualCostSavings: 800000,
      roiPercentage: 100,
    });

    // Verify no calculation errors
    expect(result.cumulativeCostThreeYears).toBeGreaterThan(0);
    expect(result.roiPercentage).toBeGreaterThanOrEqual(0);
    expect(Number.isNaN(result.roiPercentage)).toBe(false);
  });
});