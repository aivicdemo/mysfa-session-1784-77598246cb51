import {
  calculateSalesforceThreeYearCost,
  calculateCustomSystemThreeYearCost,
  calculateCostSavings,
  calculateROI,
  generateROIAnalysisChart,
} from "../../src/logic/it-1-br-1784969812908-1-1-1";

describe("Salesforce ライセンス利用状況の可視化機能（ROI試算・コスト比較分析）", () => {
  test("SCEN-065: ROI試算・コスト比較分析機能 - Salesforceライセンス費用と自社開発システムの総コストから3年間のROI試算が正確に計算される", () => {
    // テストデータ: Salesforceライセンス費用の定義
    const salesforceInitialCost = 500000; // 初期費用: 50万円
    const salesforceMonthlyCost = 150000; // 月額費用: 15万円

    // テストデータ: 自社開発システムの総コスト
    const customSystemDevelopmentCost = 3000000; // 開発費: 300万円
    const customSystemMonthlyMaintenanceCost = 50000; // 月額保守費: 5万円
    const customSystemMonthlyOperationCost = 30000; // 月額運用費: 3万円

    // 分析対象期間: 3年間（36ヶ月）
    const analysisMonths = 36;

    // ステップ1: Salesforceライセンス費用の3年間総額を計算
    // 計算式: 初期費用 + (月額費用 × 36ヶ月) = 500,000 + (150,000 × 36) = 500,000 + 5,400,000 = 5,900,000円
    const salesforceThreeYearCost = calculateSalesforceThreeYearCost(
      salesforceInitialCost,
      salesforceMonthlyCost,
      analysisMonths
    );
    expect(salesforceThreeYearCost).toBe(5900000);

    // ステップ2: 自社開発システムの3年間総コストを計算
    // 計算式: 開発費 + ((月額保守費 + 月額運用費) × 36ヶ月)
    // = 3,000,000 + ((50,000 + 30,000) × 36) = 3,000,000 + (80,000 × 36) = 3,000,000 + 2,880,000 = 5,880,000円
    const customSystemThreeYearCost = calculateCustomSystemThreeYearCost(
      customSystemDevelopmentCost,
      customSystemMonthlyMaintenanceCost,
      customSystemMonthlyOperationCost,
      analysisMonths
    );
    expect(customSystemThreeYearCost).toBe(5880000);

    // ステップ3: コスト削減額を計算
    // 計算式: Salesforce費用 - 自社開発システム費用 = 5,900,000 - 5,880,000 = 20,000円
    const costSavings = calculateCostSavings(
      salesforceThreeYearCost,
      customSystemThreeYearCost
    );
    expect(costSavings).toBe(20000);

    // ステップ4: ROI（投資利益率）を計算
    // 計算式: (削減額 / 投資額) × 100 = (20,000 / 3,000,000) × 100 = 0.67%（小数点第2位まで）
    const roi = calculateROI(costSavings, customSystemDevelopmentCost);
    expect(roi).toBeCloseTo(0.67, 2);

    // ステップ5: ROI試算結果がグラフやチャートに正確に反映されていることを確認
    const chartData = generateROIAnalysisChart(
      salesforceThreeYearCost,
      customSystemThreeYearCost,
      costSavings,
      roi
    );

    // グラフデータの構造検証
    expect(chartData).toHaveProperty("title");
    expect(chartData.title).toBe("ROI試算・コスト比較分析");

    // グラフデータのコスト情報が正確に反映されていることを検証
    expect(chartData).toHaveProperty("datasets");
    expect(Array.isArray(chartData.datasets)).toBe(true);

    // Salesforceコストデータセット
    const salesforceDataset = chartData.datasets.find(
      (ds: { label: string }) => ds.label === "Salesforceライセンス費用"
    );
    expect(salesforceDataset).toBeDefined();
    expect(salesforceDataset.data).toEqual([5900000]);

    // 自社開発システムコストデータセット
    const customSystemDataset = chartData.datasets.find(
      (ds: { label: string }) => ds.label === "自社開発システム総コスト"
    );
    expect(customSystemDataset).toBeDefined();
    expect(customSystemDataset.data).toEqual([5880000]);

    // グラフメタデータにROIとコスト削減額が正確に反映されていることを検証
    expect(chartData).toHaveProperty("metadata");
    expect(chartData.metadata.costSavings).toBe(20000);
    expect(chartData.metadata.roi).toBeCloseTo(0.67, 2);
    expect(chartData.metadata.roiPercentage).toBe("0.67%");

    // グラフのX軸ラベルが3年間の期間を示していることを確認
    expect(chartData).toHaveProperty("labels");
    expect(chartData.labels).toEqual(["3年間（36ヶ月）"]);

    // 全体的な計算結果の整合性検証
    expect(salesforceThreeYearCost).toBeGreaterThan(customSystemThreeYearCost);
    expect(costSavings).toBeGreaterThan(0);
    expect(roi).toBeGreaterThan(0);

    // 小数点第2位までの精度確認
    expect(Number.isFinite(roi)).toBe(true);
    const roiDecimalPlaces = (roi.toString().split(".")[1] || "").length;
    expect(roiDecimalPlaces).toBeLessThanOrEqual(2);
  });
});