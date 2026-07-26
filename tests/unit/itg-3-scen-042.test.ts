import { calculateMultiYearROI } from '../../src/logic/it-1-br-1784969812908-1-1-1';

describe('Salesforce License Usage Visualization - Multi-Year ROI Calculation', () => {
  // SCEN-042
  test('should calculate annual ROI accurately with multi-year investment and revenue data', () => {
    const year1_investment = 1000000;
    const year1_revenue = 1500000;
    const year2_investment = 1200000;
    const year2_revenue = 1800000;
    const year3_investment = 1400000;
    const year3_revenue = 2100000;

    const roiData = [
      { year: 1, investment: year1_investment, revenue: year1_revenue },
      { year: 2, investment: year2_investment, revenue: year2_revenue },
      { year: 3, investment: year3_investment, revenue: year3_revenue },
    ];

    const result = calculateMultiYearROI(roiData);

    expect(result.yearlyROI).toEqual([
      { year: 1, roi: 50.00 },
      { year: 2, roi: 50.00 },
      { year: 3, roi: 50.00 },
    ]);

    const totalInvestment = year1_investment + year2_investment + year3_investment;
    const totalRevenue = year1_revenue + year2_revenue + year3_revenue;
    const cumulativeROI = ((totalRevenue - totalInvestment) / totalInvestment) * 100;

    expect(result.cumulativeROI).toBe(50.00);
    expect(result.totalInvestment).toBe(3600000);
    expect(result.totalRevenue).toBe(5400000);
  });

  test('should handle different investment and revenue scenarios with consistent decimal precision', () => {
    const alternativeData = [
      { year: 1, investment: 500000, revenue: 750000 },
      { year: 2, investment: 600000, revenue: 900000 },
      { year: 3, investment: 700000, revenue: 1050000 },
    ];

    const result = calculateMultiYearROI(alternativeData);

    expect(result.yearlyROI).toEqual([
      { year: 1, roi: 50.00 },
      { year: 2, roi: 50.00 },
      { year: 3, roi: 50.00 },
    ]);

    expect(result.cumulativeROI).toBe(50.00);
    expect(result.totalInvestment).toBe(1800000);
    expect(result.totalRevenue).toBe(2700000);
  });

  test('should maintain precision to two decimal places for edge case ROI values', () => {
    const edgeCaseData = [
      { year: 1, investment: 1000000, revenue: 1250000 },
      { year: 2, investment: 900000, revenue: 1080000 },
      { year: 3, investment: 1100000, revenue: 1320000 },
    ];

    const result = calculateMultiYearROI(edgeCaseData);

    expect(result.yearlyROI).toEqual([
      { year: 1, roi: 25.00 },
      { year: 2, roi: 20.00 },
      { year: 3, roi: 20.00 },
    ]);

    const totalInvestment = 1000000 + 900000 + 1100000;
    const totalRevenue = 1250000 + 1080000 + 1320000;
    const expectedCumulativeROI = ((totalRevenue - totalInvestment) / totalInvestment) * 100;

    expect(result.cumulativeROI).toBeCloseTo(21.62, 2);
    expect(result.totalInvestment).toBe(3000000);
    expect(result.totalRevenue).toBe(3650000);
  });

  test('should throw error when investment amount is zero or negative', () => {
    const invalidData = [
      { year: 1, investment: 0, revenue: 1500000 },
    ];

    expect(() => calculateMultiYearROI(invalidData)).toThrow(/投資額/);
  });

  test('should throw error when roiData array is empty', () => {
    const emptyData: Array<{ year: number; investment: number; revenue: number }> = [];

    expect(() => calculateMultiYearROI(emptyData)).toThrow(/データ/);
  });

  test('should calculate ROI correctly when revenue equals investment amount', () => {
    const breakEvenData = [
      { year: 1, investment: 1000000, revenue: 1000000 },
    ];

    const result = calculateMultiYearROI(breakEvenData);

    expect(result.yearlyROI).toEqual([
      { year: 1, roi: 0.00 },
    ]);
    expect(result.cumulativeROI).toBe(0.00);
  });

  test('should handle large dataset with consistent calculation across years', () => {
    const largeDataset = [
      { year: 1, investment: 2500000, revenue: 3750000 },
      { year: 2, investment: 2800000, revenue: 4200000 },
      { year: 3, investment: 3100000, revenue: 4650000 },
      { year: 4, investment: 3400000, revenue: 5100000 },
      { year: 5, investment: 3700000, revenue: 5550000 },
    ];

    const result = calculateMultiYearROI(largeDataset);

    expect(result.yearlyROI).toEqual([
      { year: 1, roi: 50.00 },
      { year: 2, roi: 50.00 },
      { year: 3, roi: 50.00 },
      { year: 4, roi: 50.00 },
      { year: 5, roi: 50.00 },
    ]);

    const totalInvestment = 2500000 + 2800000 + 3100000 + 3400000 + 3700000;
    const totalRevenue = 3750000 + 4200000 + 4650000 + 5100000 + 5550000;

    expect(result.totalInvestment).toBe(15500000);
    expect(result.totalRevenue).toBe(23250000);
    expect(result.cumulativeROI).toBe(50.00);
  });
});