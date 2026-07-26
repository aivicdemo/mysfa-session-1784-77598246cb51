import {
  calculateMultiYearCostComparison,
} from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-291
  test("複数年度コスト比較・ROI計算機能 - Salesforce継続時と自社開発導入時の1年目から5年目までの累積コストが正しく計算される", () => {
    // Salesforce継続時のコスト条件
    const salesforceAnnualLicenseCost = 500000;
    const salesforceAnnualMaintenanceCost = 100000;
    const salesforceTotalAnnualCost = 600000;

    // 自社開発導入時のコスト条件
    const developmentInitialCost = 5000000;
    const developmentAnnualMaintenanceCost = 400000;
    const developmentAnnualInfrastructureCost = 150000;
    const developmentTotalAnnualCost = 550000;

    // 計算対象期間：1年目～5年目
    const years = 5;

    const result = calculateMultiYearCostComparison({
      salesforceAnnualCost: salesforceTotalAnnualCost,
      developmentInitialCost: developmentInitialCost,
      developmentAnnualCost: developmentTotalAnnualCost,
      years: years,
    });

    // 期待値の計算
    // Salesforce継続時の累積コスト
    const salesforceCumulativeCosts = [
      600000, // 1年目: 600,000
      1200000, // 2年目: 600,000 * 2
      1800000, // 3年目: 600,000 * 3
      2400000, // 4年目: 600,000 * 4
      3000000, // 5年目: 600,000 * 5
    ];

    // 自社開発導入時の累積コスト
    const developmentCumulativeCosts = [
      5550000, // 1年目: 5,000,000 + 550,000
      6100000, // 2年目: 5,000,000 + (550,000 * 2)
      6650000, // 3年目: 5,000,000 + (550,000 * 3)
      7200000, // 4年目: 5,000,000 + (550,000 * 4)
      7750000, // 5年目: 5,000,000 + (550,000 * 5)
    ];

    // ROI計算（5年間の削減効果）
    const totalSalesforceAnnualCostOver5Years = 3000000;
    const totalDevelopmentCostOver5Years = 7750000;
    const annualSavings = -4750000; // 負値 = 初期投資が大きい
    const roi = ((totalSalesforceAnnualCostOver5Years - totalDevelopmentCostOver5Years) / totalDevelopmentCostOver5Years) * 100;
    // roi = (3,000,000 - 7,750,000) / 7,750,000 * 100 = -38.71%

    // 成功パス：各年度の累積コストが正しく計算されている
    expect(result).toEqual({
      salesforceCumulativeCosts: salesforceCumulativeCosts,
      developmentCumulativeCosts: developmentCumulativeCosts,
      yearlyComparison: [
        {
          year: 1,
          salesforceCumulative: 600000,
          developmentCumulative: 5550000,
          difference: -4950000,
        },
        {
          year: 2,
          salesforceCumulative: 1200000,
          developmentCumulative: 6100000,
          difference: -4900000,
        },
        {
          year: 3,
          salesforceCumulative: 1800000,
          developmentCumulative: 6650000,
          difference: -4850000,
        },
        {
          year: 4,
          salesforceCumulative: 2400000,
          developmentCumulative: 7200000,
          difference: -4800000,
        },
        {
          year: 5,
          salesforceCumulative: 3000000,
          developmentCumulative: 7750000,
          difference: -4750000,
        },
      ],
      roi: expect.closeTo(roi, 2),
      totalSavings: annualSavings,
      breakEvenYear: null,
    });

    // Salesforce継続時の1年目から5年目の累積コスト検証
    expect(result.salesforceCumulativeCosts[0]).toBe(600000);
    expect(result.salesforceCumulativeCosts[1]).toBe(1200000);
    expect(result.salesforceCumulativeCosts[2]).toBe(1800000);
    expect(result.salesforceCumulativeCosts[3]).toBe(2400000);
    expect(result.salesforceCumulativeCosts[4]).toBe(3000000);

    // 自社開発導入時の1年目から5年目の累積コスト検証
    expect(result.developmentCumulativeCosts[0]).toBe(5550000);
    expect(result.developmentCumulativeCosts[1]).toBe(6100000);
    expect(result.developmentCumulativeCosts[2]).toBe(6650000);
    expect(result.developmentCumulativeCosts[3]).toBe(7200000);
    expect(result.developmentCumulativeCosts[4]).toBe(7750000);

    // 各年度別の累積コスト比較が表示されていることを確認
    expect(result.yearlyComparison.length).toBe(5);
    expect(result.yearlyComparison[0]).toEqual({
      year: 1,
      salesforceCumulative: 600000,
      developmentCumulative: 5550000,
      difference: -4950000,
    });
    expect(result.yearlyComparison[4]).toEqual({
      year: 5,
      salesforceCumulative: 3000000,
      developmentCumulative: 7750000,
      difference: -4750000,
    });

    // ROI計算結果が正しく表示されていることを確認
    expect(result.roi).toEqual(expect.closeTo(-38.71, 1));
    expect(result.totalSavings).toBe(-4750000);

    // 本シナリオでは5年目までに損益分岐点に達しないため、breakEvenYearはnull
    expect(result.breakEvenYear).toBeNull();
  });
});