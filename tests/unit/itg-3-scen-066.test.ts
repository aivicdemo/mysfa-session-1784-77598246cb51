import { calculateAnnualCostSavings } from '../../src/logic/it-1-br-1784969812908-1-1-1';

describe('Salesforce ライセンス利用状況の可視化機能（ROI試算・コスト比較分析）', () => {
  // SCEN-066
  test('年間削減効果がライセンス費用と自社開発システムコストの差分として定量的に算出される', () => {
    // 前提: Salesforceの現在のライセンス費用と自社開発システムの初期構築・年間保守コストが把握されている状態
    // 発生条件: 財務・管理部門がSalesforceライセンス費用との比較表を作成する際に、複数年度にわたるコスト削減効果をシミュレーションする必要が生じたとき
    // 結果: 年間削減効果が自社開発システムの年間維持コストとライセンス費用の差分として正確に計算・表示される

    // 入力値の設定
    const annualSalesforceFeeCost = 1000000; // ライセンス費用: 1,000,000円
    const annualInternalSystemMaintenanceCost = 1500000; // 自社開発システムの年間維持コスト: 1,500,000円

    // 手順: ROI試算・コスト比較分析機能で年間削減効果を計算
    const result = calculateAnnualCostSavings({
      annualLicenseFee: annualSalesforceFeeCost,
      annualSystemMaintenanceCost: annualInternalSystemMaintenanceCost,
    });

    // 期待値の計算: 自社開発システムコスト - ライセンス費用 = 1,500,000 - 1,000,000 = 500,000円
    const expectedAnnualCostSavings = 500000;

    // 検証1: 年間削減効果が正確に計算されること
    expect(result.annualCostSavings).toBe(expectedAnnualCostSavings);

    // 検証2: 計算結果が数値型で返却されること
    expect(typeof result.annualCostSavings).toBe('number');

    // 検証3: 小数点以下が適切に丸め処理されていること
    expect(Number.isInteger(result.annualCostSavings)).toBe(true);

    // 検証4: 結果オブジェクトが期待される構造を持つこと
    expect(result).toHaveProperty('annualCostSavings');
    expect(result.annualCostSavings).toBeGreaterThanOrEqual(0);
  });
});