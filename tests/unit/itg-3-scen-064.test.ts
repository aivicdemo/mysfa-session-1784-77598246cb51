import { calculateROIComparison } from "../../src/logic/it-1-br-1784969812908-1-1-1";

describe("Salesforce ライセンス利用状況の可視化機能", () => {
  // SCEN-064
  test("両コスト選択肢が完全に等値の場合、同等の投資判断が提示される", () => {
    // 現在のSalesforceライセンス費用: 100,000円/年
    const salesforceLicenseCostPerYear = 100000;
    
    // 代替案（自社開発システム）のコスト
    const developmentInitialCost = 100000;
    const developmentAnnualMaintenanceCost = 0;
    
    // 比較期間: 1年
    const comparisonYears = 1;
    
    // 入力パラメータ
    const roiInput = {
      salesforceLicenseCostPerYear,
      developmentInitialCost,
      developmentAnnualMaintenanceCost,
      comparisonYears,
      userCount: 10,
      editionDistribution: { Professional: 10 },
    };
    
    const result = calculateROIComparison(roiInput);
    
    // 年1: Salesforce継続 = 100,000円、自社開発 = 100,000円（初期構築のみ）
    // 総コストが完全に等値
    expect(result.totalCostSalesforce).toBe(100000);
    expect(result.totalCostDevelopment).toBe(100000);
    
    // コスト差分 = 0
    expect(result.annualSavings).toBe(0);
    
    // ROI = 0%（投資回収効果がない）
    expect(result.roi).toBe(0);
    
    // 投資判断メッセージ: 両案が経済的に同等であることを示す
    expect(result.investmentDecisionMessage).toMatch(/同等|差分なし|経済的に同等/);
    
    // 投資判断: 費用面では判断できないため、他の要因による判断が必要
    expect(result.investmentRecommendation).toMatch(/同等|判断保留|他要因|詳細検討/);
    
    // ROI回収期間が計算不可（差分がないため）またはnull
    expect(result.recoveryPeriodYears === null || result.recoveryPeriodYears === Infinity).toBe(true);
  });
});