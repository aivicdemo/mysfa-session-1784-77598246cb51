import { calculateROIComparison } from '../../src/logic/it-1-br-1784969812908-1-1-1';

describe('Salesforce ライセンス利用状況の可視化機能', () => {
  // SCEN-070
  test('ROI試算・コスト比較分析機能 - ライセンス費用が自社開発システムコストより高い場合も負のROIとして正確に表示される', () => {
    // Setup: Salesforceライセンス年間費用 = 150万円、自社開発システム年間維持コスト = 100万円
    const salesforceLicenseCostPerYear = 1500000;
    const internalSystemAnnualMaintenanceCost = 1000000;
    const internalSystemInitialConstructionCost = 2000000;

    // Execute: ROI試算・コスト比較分析を実行
    const result = calculateROIComparison({
      salesforceLicenseCostPerYear,
      internalSystemAnnualMaintenanceCost,
      internalSystemInitialConstructionCost,
    });

    // Verify: 負のROI値が正確に計算・表示されていることを検証

    // 1. コスト差分が正しく計算されていることを確認（ライセンス費用 - 自社開発コスト = 1,500,000 - 1,000,000 = 500,000）
    expect(result.costDifference).toBe(500000);

    // 2. 負のROI率が正確に計算されていることを確認（-（差分/自社開発コスト）×100 = -(500000/1000000)×100 = -50%）
    expect(result.roiPercentage).toBe(-50);

    // 3. 1年目のROI試算が正確であることを確認（1年目：ライセンス継続累積コスト = 1,500,000、自社開発システム累積コスト = 2,000,000 + 1,000,000 = 3,000,000）
    expect(result.yearlyComparison[0].year).toBe(1);
    expect(result.yearlyComparison[0].salesforceCumulativeCost).toBe(1500000);
    expect(result.yearlyComparison[0].internalSystemCumulativeCost).toBe(3000000);
    expect(result.yearlyComparison[0].annualSavings).toBe(-1500000);

    // 4. 2年目のROI試算が正確であることを確認（2年目：ライセンス継続累積コスト = 1,500,000 × 2 = 3,000,000、自社開発システム累積コスト = 2,000,000 + 1,000,000 × 2 = 4,000,000）
    expect(result.yearlyComparison[1].year).toBe(2);
    expect(result.yearlyComparison[1].salesforceCumulativeCost).toBe(3000000);
    expect(result.yearlyComparison[1].internalSystemCumulativeCost).toBe(4000000);
    expect(result.yearlyComparison[1].annualSavings).toBe(-1000000);

    // 5. 3年目のROI試算が正確であることを確認（3年目：ライセンス継続累積コスト = 1,500,000 × 3 = 4,500,000、自社開発システム累積コスト = 2,000,000 + 1,000,000 × 3 = 5,000,000）
    expect(result.yearlyComparison[2].year).toBe(3);
    expect(result.yearlyComparison[2].salesforceCumulativeCost).toBe(4500000);
    expect(result.yearlyComparison[2].internalSystemCumulativeCost).toBe(5000000);
    expect(result.yearlyComparison[2].annualSavings).toBe(-500000);

    // 6. 4年目のROI試算が正確であることを確認（4年目：ライセンス継続累積コスト = 1,500,000 × 4 = 6,000,000、自社開発システム累積コスト = 2,000,000 + 1,000,000 × 4 = 6,000,000）
    expect(result.yearlyComparison[3].year).toBe(4);
    expect(result.yearlyComparison[3].salesforceCumulativeCost).toBe(6000000);
    expect(result.yearlyComparison[3].internalSystemCumulativeCost).toBe(6000000);
    expect(result.yearlyComparison[3].annualSavings).toBe(0);

    // 7. 5年目のROI試算が正確であることを確認（5年目：ライセンス継続累積コスト = 1,500,000 × 5 = 7,500,000、自社開発システム累積コスト = 2,000,000 + 1,000,000 × 5 = 7,000,000）
    expect(result.yearlyComparison[4].year).toBe(5);
    expect(result.yearlyComparison[4].salesforceCumulativeCost).toBe(7500000);
    expect(result.yearlyComparison[4].internalSystemCumulativeCost).toBe(7000000);
    expect(result.yearlyComparison[4].annualSavings).toBe(500000);

    // 8. グラフ表現用のデータ構造が正しく生成されていることを確認
    expect(result.chartData).toBeDefined();
    expect(result.chartData.length).toBe(5);
    expect(result.chartData[0]).toEqual({
      year: 1,
      salesforceCumulative: 1500000,
      internalSystemCumulative: 3000000,
    });

    // 9. ダッシュボードの警告フラグが設定されていることを確認（ライセンス費用が高いため）
    expect(result.warningStatus).toBe('LICENSE_COST_HIGHER');

    // 10. 投資回収期間（Break-even point）の計算が正確であることを確認（4年目で均衡）
    expect(result.breakEvenYear).toBe(4);

    // 11. 最終的なROI指標値が負として正確に計算されていることを確認（3年間の平均ROI = (-50% + (-50%) + (-16.67%)) / 3 = -38.89%）
    expect(result.threeYearAverageROI).toBeCloseTo(-38.89, 1);

    // 12. コスト効率性の指標が正しく表示されていることを確認
    expect(result.costEfficiency).toBe('INEFFICIENT');

    // 13. 結果の型が正確であることを確認
    expect(typeof result.costDifference).toBe('number');
    expect(typeof result.roiPercentage).toBe('number');
    expect(Array.isArray(result.yearlyComparison)).toBe(true);
    expect(Array.isArray(result.chartData)).toBe(true);
    expect(typeof result.warningStatus).toBe('string');
    expect(typeof result.breakEvenYear).toBe('number');
  });
});