import { calculateMultiYearROI } from '../../src/logic/it-1-br-1784969812908-1-1-1';

describe('Salesforce ライセンス利用状況の可視化機能 - 複数年度ROI算出', () => {
  // SCEN-044
  test('初期構築コストが不正な値の場合にエラーが発生する', () => {
    // 負の数の場合
    expect(() =>
      calculateMultiYearROI({
        initialConstructionCost: -1000000,
        annualMaintenanceCost: 500000,
        currentSalesforceAnnualCost: 1500000,
        yearCount: 5,
      })
    ).toThrow(/初期構築コスト/);

    // 0未満の負の数
    expect(() =>
      calculateMultiYearROI({
        initialConstructionCost: -500000,
        annualMaintenanceCost: 300000,
        currentSalesforceAnnualCost: 1200000,
        yearCount: 3,
      })
    ).toThrow(/初期構築コスト/);

    // NaN の場合
    expect(() =>
      calculateMultiYearROI({
        initialConstructionCost: NaN,
        annualMaintenanceCost: 400000,
        currentSalesforceAnnualCost: 1000000,
        yearCount: 5,
      })
    ).toThrow(/初期構築コスト/);

    // Infinity の場合
    expect(() =>
      calculateMultiYearROI({
        initialConstructionCost: Infinity,
        annualMaintenanceCost: 200000,
        currentSalesforceAnnualCost: 800000,
        yearCount: 5,
      })
    ).toThrow(/初期構築コスト/);

    // null の場合
    expect(() =>
      calculateMultiYearROI({
        initialConstructionCost: null as any,
        annualMaintenanceCost: 300000,
        currentSalesforceAnnualCost: 1000000,
        yearCount: 5,
      })
    ).toThrow(/初期構築コスト/);

    // undefined の場合
    expect(() =>
      calculateMultiYearROI({
        initialConstructionCost: undefined as any,
        annualMaintenanceCost: 300000,
        currentSalesforceAnnualCost: 1000000,
        yearCount: 5,
      })
    ).toThrow(/初期構築コスト/);

    // 正常な値の場合はエラーが発生しない
    const validResult = calculateMultiYearROI({
      initialConstructionCost: 2000000,
      annualMaintenanceCost: 500000,
      currentSalesforceAnnualCost: 1500000,
      yearCount: 5,
    });

    expect(validResult).toBeDefined();
    expect(validResult.yearlyComparison).toBeDefined();
    expect(Array.isArray(validResult.yearlyComparison)).toBe(true);
    expect(validResult.yearlyComparison.length).toBe(5);

    // 1年目: Salesforce累積 1500000, 自社開発累積 2500000（初期構築2000000+運用500000）
    expect(validResult.yearlyComparison[0].year).toBe(1);
    expect(validResult.yearlyComparison[0].cumulativeSalesforceAnnualCost).toBe(1500000);
    expect(validResult.yearlyComparison[0].cumulativeInHouseSystemCost).toBe(2500000);
    expect(validResult.yearlyComparison[0].annualSavings).toBe(-1000000);
    expect(validResult.yearlyComparison[0].roiPercentage).toBe(-50);

    // 2年目: Salesforce累積 3000000, 自社開発累積 3000000（初期構築2000000+運用500000×2）
    expect(validResult.yearlyComparison[1].year).toBe(2);
    expect(validResult.yearlyComparison[1].cumulativeSalesforceAnnualCost).toBe(3000000);
    expect(validResult.yearlyComparison[1].cumulativeInHouseSystemCost).toBe(3000000);
    expect(validResult.yearlyComparison[1].annualSavings).toBe(0);
    expect(validResult.yearlyComparison[1].roiPercentage).toBe(0);

    // 3年目: Salesforce累積 4500000, 自社開発累積 3500000（初期構築2000000+運用500000×3）
    expect(validResult.yearlyComparison[2].year).toBe(3);
    expect(validResult.yearlyComparison[2].cumulativeSalesforceAnnualCost).toBe(4500000);
    expect(validResult.yearlyComparison[2].cumulativeInHouseSystemCost).toBe(3500000);
    expect(validResult.yearlyComparison[2].annualSavings).toBe(1000000);
    expect(validResult.yearlyComparison[2].roiPercentage).toBe(50);

    // 4年目: Salesforce累積 6000000, 自社開発累積 4000000（初期構築2000000+運用500000×4）
    expect(validResult.yearlyComparison[3].year).toBe(4);
    expect(validResult.yearlyComparison[3].cumulativeSalesforceAnnualCost).toBe(6000000);
    expect(validResult.yearlyComparison[3].cumulativeInHouseSystemCost).toBe(4000000);
    expect(validResult.yearlyComparison[3].annualSavings).toBe(2000000);
    expect(validResult.yearlyComparison[3].roiPercentage).toBe(100);

    // 5年目: Salesforce累積 7500000, 自社開発累積 4500000（初期構築2000000+運用500000×5）
    expect(validResult.yearlyComparison[4].year).toBe(5);
    expect(validResult.yearlyComparison[4].cumulativeSalesforceAnnualCost).toBe(7500000);
    expect(validResult.yearlyComparison[4].cumulativeInHouseSystemCost).toBe(4500000);
    expect(validResult.yearlyComparison[4].annualSavings).toBe(3000000);
    expect(validResult.yearlyComparison[4].roiPercentage).toBe(150);
  });
});