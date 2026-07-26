import { calculateMultiYearROI } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-293
  test('初期構築コストがゼロまたは負の値の場合、適切にエラーハンドリングされる', () => {
    // 初期構築コストが0の場合
    expect(() =>
      calculateMultiYearROI({
        initialConstructionCost: 0,
        annualMaintenanceCost: 500000,
        salesforceAnnualLicenseCost: 1200000,
        yearsToCompare: 5,
      })
    ).toThrow(/初期構築コスト/);

    // 初期構築コストが負の値の場合
    expect(() =>
      calculateMultiYearROI({
        initialConstructionCost: -1000000,
        annualMaintenanceCost: 500000,
        salesforceAnnualLicenseCost: 1200000,
        yearsToCompare: 5,
      })
    ).toThrow(/初期構築コスト/);

    // 正の初期構築コストで成功パス（参考）
    const validResult = calculateMultiYearROI({
      initialConstructionCost: 5000000,
      annualMaintenanceCost: 500000,
      salesforceAnnualLicenseCost: 1200000,
      yearsToCompare: 5,
    });

    expect(validResult).toBeDefined();
    expect(validResult.yearlyComparison).toBeDefined();
    expect(validResult.yearlyComparison.length).toBe(5);

    // 1年目: Salesforce継続の累積コスト = 1200000
    // 1年目: 自社システムの累積コスト = 5000000 + 500000 = 5500000
    expect(validResult.yearlyComparison[0].salesforceCumulativeCost).toBe(1200000);
    expect(validResult.yearlyComparison[0].inHouseCumulativeCost).toBe(5500000);
    expect(validResult.yearlyComparison[0].annualSavings).toBe(-4300000);

    // 5年目: Salesforce継続の累積コスト = 1200000 * 5 = 6000000
    // 5年目: 自社システムの累積コスト = 5000000 + (500000 * 5) = 7500000
    expect(validResult.yearlyComparison[4].salesforceCumulativeCost).toBe(6000000);
    expect(validResult.yearlyComparison[4].inHouseCumulativeCost).toBe(7500000);
    expect(validResult.yearlyComparison[4].annualSavings).toBe(-1500000);

    // ROI = (Salesforceコスト - 自社コスト) / 自社コスト * 100
    // 5年間のROI = (6000000 - 7500000) / 7500000 * 100 = -20
    expect(validResult.roi).toBe(-20);

    // 回収期間が設定されていない場合（自社コストが高いため）
    expect(validResult.paybackPeriodYears).toBeNull();
  });
});