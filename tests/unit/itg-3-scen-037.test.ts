import { generateCostComparisonTable } from "../../src/logic/it-1-br-1784969812908-1-1-1";

describe("Salesforce ライセンス利用状況の可視化機能", () => {
  // SCEN-037: [edge] コスト比較表生成機能 - 年間削減額がマイナスの場合も正確に計算される
  test("年間削減額がマイナスの場合も正確に計算される", () => {
    const input = {
      currentYearSalesforceAnnualCost: 1200000,
      previousYearSalesforceAnnualCost: 800000,
      systemInitialConstructionCost: 500000,
      systemAnnualMaintenanceCost: 300000,
      comparisonPeriodYears: 3,
      licenseTypes: [
        {
          name: "Professional Edition",
          currentYearQuantity: 50,
          currentYearUnitPrice: 15000,
          previousYearQuantity: 30,
          previousYearUnitPrice: 15000,
        },
        {
          name: "Enterprise Edition",
          currentYearQuantity: 20,
          currentYearUnitPrice: 30000,
          previousYearQuantity: 25,
          previousYearUnitPrice: 28000,
        },
      ],
    };

    const result = generateCostComparisonTable(input);

    expect(result).toBeDefined();
    expect(result.comparisonTable).toBeDefined();
    expect(Array.isArray(result.comparisonTable)).toBe(true);

    // Year 1: Salesforce cost = 1,200,000 + system cost = 300,000 = 1,500,000
    // Year 1 cumulative Salesforce = 1,200,000
    // Year 1 cumulative system = 500,000 + 300,000 = 800,000
    // Year 1 reduction = 1,200,000 - 800,000 = 400,000 (positive)
    const year1Row = result.comparisonTable[0];
    expect(year1Row.year).toBe(1);
    expect(year1Row.salesforceCumulativeCost).toBe(1200000);
    expect(year1Row.systemCumulativeCost).toBe(800000);
    expect(year1Row.annualReductionAmount).toBe(400000);

    // Year 2: Only maintenance cost applies to system
    // Year 2 Salesforce = 1,200,000
    // Year 2 cumulative Salesforce = 1,200,000 + 1,200,000 = 2,400,000
    // Year 2 cumulative system = 800,000 + 300,000 = 1,100,000
    // Year 2 reduction = 1,200,000 - 300,000 = 900,000 (positive)
    const year2Row = result.comparisonTable[1];
    expect(year2Row.year).toBe(2);
    expect(year2Row.salesforceCumulativeCost).toBe(2400000);
    expect(year2Row.systemCumulativeCost).toBe(1100000);
    expect(year2Row.annualReductionAmount).toBe(900000);

    // Year 3: Only maintenance cost applies to system
    // Year 3 cumulative Salesforce = 2,400,000 + 1,200,000 = 3,600,000
    // Year 3 cumulative system = 1,100,000 + 300,000 = 1,400,000
    // Year 3 reduction = 1,200,000 - 300,000 = 900,000 (positive)
    const year3Row = result.comparisonTable[2];
    expect(year3Row.year).toBe(3);
    expect(year3Row.salesforceCumulativeCost).toBe(3600000);
    expect(year3Row.systemCumulativeCost).toBe(1400000);
    expect(year3Row.annualReductionAmount).toBe(900000);

    // Test scenario where annual reduction becomes negative
    const negativeReductionInput = {
      currentYearSalesforceAnnualCost: 600000,
      previousYearSalesforceAnnualCost: 800000,
      systemInitialConstructionCost: 1000000,
      systemAnnualMaintenanceCost: 400000,
      comparisonPeriodYears: 3,
      licenseTypes: [
        {
          name: "Professional Edition",
          currentYearQuantity: 30,
          currentYearUnitPrice: 10000,
          previousYearQuantity: 40,
          previousYearUnitPrice: 10000,
        },
      ],
    };

    const negativeResult = generateCostComparisonTable(negativeReductionInput);

    expect(negativeResult).toBeDefined();
    expect(negativeResult.comparisonTable).toBeDefined();
    expect(Array.isArray(negativeResult.comparisonTable)).toBe(true);

    // Year 1: Salesforce = 600,000, System = 1,000,000 + 400,000 = 1,400,000
    // Year 1 cumulative Salesforce = 600,000
    // Year 1 cumulative system = 1,400,000
    // Year 1 reduction = 600,000 - 1,400,000 = -800,000 (NEGATIVE)
    const negYear1Row = negativeResult.comparisonTable[0];
    expect(negYear1Row.year).toBe(1);
    expect(negYear1Row.salesforceCumulativeCost).toBe(600000);
    expect(negYear1Row.systemCumulativeCost).toBe(1400000);
    expect(negYear1Row.annualReductionAmount).toBe(-800000);

    // Year 2: Only maintenance cost applies to system
    // Year 2 cumulative Salesforce = 600,000 + 600,000 = 1,200,000
    // Year 2 cumulative system = 1,400,000 + 400,000 = 1,800,000
    // Year 2 reduction = 600,000 - 400,000 = 200,000 (positive, but cumulative trend shows ROI delay)
    const negYear2Row = negativeResult.comparisonTable[1];
    expect(negYear2Row.year).toBe(2);
    expect(negYear2Row.salesforceCumulativeCost).toBe(1200000);
    expect(negYear2Row.systemCumulativeCost).toBe(1800000);
    expect(negYear2Row.annualReductionAmount).toBe(200000);

    // Year 3: Only maintenance cost applies to system
    // Year 3 cumulative Salesforce = 1,200,000 + 600,000 = 1,800,000
    // Year 3 cumulative system = 1,800,000 + 400,000 = 2,200,000
    // Year 3 reduction = 600,000 - 400,000 = 200,000
    const negYear3Row = negativeResult.comparisonTable[2];
    expect(negYear3Row.year).toBe(3);
    expect(negYear3Row.salesforceCumulativeCost).toBe(1800000);
    expect(negYear3Row.systemCumulativeCost).toBe(2200000);
    expect(negYear3Row.annualReductionAmount).toBe(200000);

    // Verify ROI calculation for negative reduction scenario
    expect(negativeResult.roi).toBeDefined();
    expect(typeof negativeResult.roi).toBe("number");
    // ROI = (total savings / initial investment) * 100
    // For year 3: total savings = sum of annual reductions = -800,000 + 200,000 + 200,000 = -400,000
    // ROI = (-400,000 / 1,000,000) * 100 = -40%
    expect(negativeResult.roi).toBe(-40);

    // Verify currency formatting with negative values
    expect(negativeResult.formattedTable).toBeDefined();
    expect(Array.isArray(negativeResult.formattedTable)).toBe(true);

    // Check negative value formatting in Year 1
    const formattedNegYear1 = negativeResult.formattedTable[0];
    expect(formattedNegYear1.annualReductionFormatted).toMatch(/^-\$/);
    expect(formattedNegYear1.annualReductionFormatted).toBe("-$800,000.00");

    // Check positive value formatting in Year 2
    const formattedPosYear2 = negativeResult.formattedTable[1];
    expect(formattedPosYear2.annualReductionFormatted).toMatch(/^\$/);
    expect(formattedPosYear2.annualReductionFormatted).toBe("$200,000.00");

    // Verify cumulative calculations preserve negative values
    expect(formattedNegYear1.salesforceCumulativeFormatted).toBe("$600,000.00");
    expect(formattedNegYear1.systemCumulativeFormatted).toBe("$1,400,000.00");

    // Test mixed positive and negative reduction amounts
    const mixedInput = {
      currentYearSalesforceAnnualCost: 500000,
      previousYearSalesforceAnnualCost: 500000,
      systemInitialConstructionCost: 800000,
      systemAnnualMaintenanceCost: 350000,
      comparisonPeriodYears: 3,
      licenseTypes: [
        {
          name: "Standard Edition",
          currentYearQuantity: 20,
          currentYearUnitPrice: 15000,
          previousYearQuantity: 20,
          previousYearUnitPrice: 15000,
        },
        {
          name: "Advanced Edition",
          currentYearQuantity: 15,
          currentYearUnitPrice: 25000,
          previousYearQuantity: 10,
          previousYearUnitPrice: 25000,
        },
      ],
    };

    const mixedResult = generateCostComparisonTable(mixedInput);

    expect(mixedResult.comparisonTable).toBeDefined();
    expect(mixedResult.comparisonTable.length).toBe(3);

    // Year 1: Salesforce = 500,000, System = 800,000 + 350,000 = 1,150,000
    // Year 1 reduction = 500,000 - 1,150,000 = -650,000 (NEGATIVE)
    const mixYear1 = mixedResult.comparisonTable[0];
    expect(mixYear1.annualReductionAmount).toBe(-650000);

    // Year 2: Salesforce = 500,000, System = 350,000
    // Year 2 reduction = 500,000 - 350,000 = 150,000 (POSITIVE)
    const mixYear2 = mixedResult.comparisonTable[1];
    expect(mixYear2.annualReductionAmount).toBe(150000);

    // Year 3: Salesforce = 500,000, System = 350,000
    // Year 3 reduction = 500,000 - 350,000 = 150,000 (POSITIVE)
    const mixYear3 = mixedResult.comparisonTable[2];
    expect(mixYear3.annualReductionAmount).toBe(150000);

    // Total 3-year reduction = -650,000 + 150,000 + 150,000 = -350,000
    // 3-year cumulative Salesforce = 1,500,000
    // 3-year cumulative system = 1,500,000
    expect(mixedResult.totalReductionAmount).toBe(-350000);

    // Verify formatted mixed values
    const formattedMixYear1 = mixedResult.formattedTable[0];
    expect(formattedMixYear1.annualReductionFormatted).toBe("-$650,000.00");
    const formattedMixYear2 = mixedResult.formattedTable[1];
    expect(formattedMixYear2.annualReductionFormatted).toBe("$150,000.00");

    // Verify total formatted value shows negative correctly
    expect(mixedResult.totalReductionFormatted).toBe("-$350,000.00");

    // Verify ROI for mixed scenario
    // ROI = (-350,000 / 800,000) * 100 = -43.75%
    expect(mixedResult.roi).toBe(-43.75);
  });
});