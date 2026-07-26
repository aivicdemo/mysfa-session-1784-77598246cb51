import {
  calculateSalesforceAnnualLicenseCost,
  calculateInHouseDevelopmentInitialCost,
  calculateInHouseMaintenanceAnnualCost,
  createCostComparisonTable,
  approveInvestmentDecision,
} from "../../src/logic/it-1-br-1784969812908-1-1-1";

describe("Salesforce license update ROI calculation and investment decision approval", () => {
  // SCEN-061
  test("should calculate ROI trial, reflect results in investment form, approve investment decision and record approval history", () => {
    // Setup: Current Salesforce license cost data
    const salesforceLicenseInput = {
      totalLicenseCount: 150,
      editionDistribution: [
        { editionId: "SALES_CLOUD", count: 100, unitPricePerMonth: 165 },
        { editionId: "SERVICE_CLOUD", count: 50, unitPricePerMonth: 165 },
      ],
      contractPeriodMonths: 12,
    };

    // Calculate annual Salesforce license cost
    const annualSalesforceExpense =
      calculateSalesforceAnnualLicenseCost(salesforceLicenseInput);
    expect(annualSalesforceExpense).toBe(297000); // (100 + 50) * 165 * 12 = 297,000

    // Setup: In-house development system cost data
    const developmentScaleInput = {
      developmentManMonths: 120,
      averageDeveloperCostPerMonth: 8500,
      infrastructureSetupCost: 50000,
      toolingAndLicenseCost: 20000,
    };

    // Calculate initial construction cost
    const initialConstructionCost =
      calculateInHouseDevelopmentInitialCost(developmentScaleInput);
    expect(initialConstructionCost).toBe(1070000); // (120 * 8500) + 50000 + 20000 = 1,070,000

    // Setup: Annual maintenance and operation cost
    const maintenanceInput = {
      developmentManMonthsPerYear: 24,
      averageDeveloperCostPerMonth: 8500,
      operationsManMonthsPerYear: 12,
      averageOperationsCostPerMonth: 5000,
    };

    // Calculate annual maintenance cost
    const annualMaintenanceCost =
      calculateInHouseMaintenanceAnnualCost(maintenanceInput);
    expect(annualMaintenanceCost).toBe(264000); // (24 * 8500) + (12 * 5000) = 264,000

    // Create cost comparison table with multi-year projection
    const comparisonInput = {
      annualSalesforceExpense: 297000,
      initialConstructionCost: 1070000,
      annualMaintenanceCost: 264000,
      projectionYears: 5,
    };

    const comparisonTable = createCostComparisonTable(comparisonInput);

    // Verify Year 1-5 cumulative costs and annual savings
    expect(comparisonTable.years).toHaveLength(5);

    // Year 1: Salesforce cumulative = 297,000, In-house cumulative = 1,070,000 + 264,000 = 1,334,000, Savings = -1,037,000
    expect(comparisonTable.years[0]).toEqual({
      year: 1,
      salesforceCumulativeCost: 297000,
      inHouseCumulativeCost: 1334000,
      annualSavings: -1037000,
      roi: -248.3,
    });

    // Year 2: Salesforce cumulative = 594,000, In-house cumulative = 1,598,000, Savings = -1,004,000
    expect(comparisonTable.years[1]).toEqual({
      year: 2,
      salesforceCumulativeCost: 594000,
      inHouseCumulativeCost: 1598000,
      annualSavings: -1004000,
      roi: -169.4,
    });

    // Year 3: Salesforce cumulative = 891,000, In-house cumulative = 1,862,000, Savings = -971,000
    expect(comparisonTable.years[2]).toEqual({
      year: 3,
      salesforceCumulativeCost: 891000,
      inHouseCumulativeCost: 1862000,
      annualSavings: -971000,
      roi: -109.0,
    });

    // Year 4: Salesforce cumulative = 1,188,000, In-house cumulative = 2,126,000, Savings = -938,000
    expect(comparisonTable.years[3]).toEqual({
      year: 4,
      salesforceCumulativeCost: 1188000,
      inHouseCumulativeCost: 2126000,
      annualSavings: -938000,
      roi: -78.9,
    });

    // Year 5: Salesforce cumulative = 1,485,000, In-house cumulative = 2,390,000, Savings = -905,000
    expect(comparisonTable.years[4]).toEqual({
      year: 5,
      salesforceCumulativeCost: 1485000,
      inHouseCumulativeCost: 2390000,
      annualSavings: -905000,
      roi: -60.9,
    });

    // Verify payback period and average annual savings calculation
    expect(comparisonTable.paybackPeriodYears).toBeGreaterThan(5);
    expect(comparisonTable.averageAnnualSavingsPerYear).toBe(-971000); // Average across 5 years

    // Setup: Investment decision approval data
    const investmentApprovalInput = {
      decisionId: "INV_DEC_20240115_001",
      approverUserId: "mgr_executive_001",
      approverName: "Executive Manager",
      approvalStatus: "APPROVED",
      roiTrialData: {
        annualSalesforceExpense: 297000,
        initialConstructionCost: 1070000,
        annualMaintenanceCost: 264000,
        projectionYears: 5,
        paybackPeriodYears: 5.8,
        threeYearROI: -109.0,
      },
      approvalRationale:
        "Despite negative short-term ROI, strategic decision to consolidate systems",
      approvalDateTime: new Date("2024-01-15T14:30:00Z"),
    };

    // Approve investment decision and record approval
    const approvalResult = approveInvestmentDecision(investmentApprovalInput);

    expect(approvalResult.decisionId).toBe("INV_DEC_20240115_001");
    expect(approvalResult.approvalStatus).toBe("APPROVED");
    expect(approvalResult.approverUserId).toBe("mgr_executive_001");
    expect(approvalResult.approverName).toBe("Executive Manager");
    expect(approvalResult.roiTrialDataSnapshot).toEqual({
      annualSalesforceExpense: 297000,
      initialConstructionCost: 1070000,
      annualMaintenanceCost: 264000,
      projectionYears: 5,
      paybackPeriodYears: 5.8,
      threeYearROI: -109.0,
    });
    expect(approvalResult.approvalRationale).toBe(
      "Despite negative short-term ROI, strategic decision to consolidate systems"
    );
    expect(approvalResult.approvalDateTime).toEqual(
      new Date("2024-01-15T14:30:00Z")
    );
    expect(approvalResult.recordedInHistoryId).toMatch(/^HIST_\d+$/);
  });
});