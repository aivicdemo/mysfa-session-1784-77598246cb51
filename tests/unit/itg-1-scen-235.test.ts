import { calculateLicenseCostEffectiveness } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-235: [edge] ライセンス費用対効果分析機能 - 投資回収期間がゼロの場合（即座に削減効果が出る場合）、ROIが無限大として扱われるか正しく処理される
  test("SCEN-235: 投資回収期間がゼロの場合、ROIが無限大として適切に処理される", () => {
    // ハッピーパス: 初期投資額 10,000 円、月次削減効果 10,000 円以上で投資回収期間ゼロのシナリオ
    const analysis_1 = {
      initial_investment: 10000,
      monthly_savings: 10000,
      analysis_period_months: 12,
    };

    const result_1 = calculateLicenseCostEffectiveness(analysis_1);

    // 投資回収期間がゼロ → ROI は無限大として処理される
    expect(result_1.payback_period_months).toBe(0);
    expect(result_1.roi).toBe(999999);
    expect(result_1.total_savings_12_months).toBe(120000);
    expect(result_1.net_benefit).toBe(110000);

    // エッジケース: 月次削減効果が初期投資より大きい場合
    const analysis_2 = {
      initial_investment: 5000,
      monthly_savings: 15000,
      analysis_period_months: 12,
    };

    const result_2 = calculateLicenseCostEffectiveness(analysis_2);

    expect(result_2.payback_period_months).toBe(0);
    expect(result_2.roi).toBe(999999);
    expect(result_2.total_savings_12_months).toBe(180000);
    expect(result_2.net_benefit).toBe(175000);

    // 複数回実行の一貫性確認: 同じ入力で複数回実行
    const result_2_retry = calculateLicenseCostEffectiveness(analysis_2);

    expect(result_2_retry.payback_period_months).toBe(
      result_2.payback_period_months
    );
    expect(result_2_retry.roi).toBe(result_2.roi);
    expect(result_2_retry.total_savings_12_months).toBe(
      result_2.total_savings_12_months
    );
    expect(result_2_retry.net_benefit).toBe(result_2.net_benefit);

    // 通常ケース: 投資回収期間がゼロでない場合の比較検証
    const analysis_3 = {
      initial_investment: 10000,
      monthly_savings: 2000,
      analysis_period_months: 12,
    };

    const result_3 = calculateLicenseCostEffectiveness(analysis_3);

    expect(result_3.payback_period_months).toBe(5);
    expect(result_3.roi).toBe(140);
    expect(result_3.total_savings_12_months).toBe(24000);
    expect(result_3.net_benefit).toBe(14000);

    // 計算結果が有効な数値として返されていることを確認（Infinity でなく、エラー値でない）
    expect(typeof result_1.roi).toBe("number");
    expect(typeof result_2.roi).toBe("number");
    expect(typeof result_3.roi).toBe("number");

    expect(isFinite(result_1.roi)).toBe(true);
    expect(isFinite(result_2.roi)).toBe(true);
    expect(isFinite(result_3.roi)).toBe(true);

    // ゼロ除算エラーが発生していないことを確認（esLint 警告の有無を確認しない、代わりに論理的妥当性を検証）
    expect(result_1.payback_period_months).not.toBeNaN();
    expect(result_2.payback_period_months).not.toBeNaN();
    expect(result_3.payback_period_months).not.toBeNaN();

    // 投資回収期間がゼロの場合、ROI が大きな数値（999999 相当）として扱われていることを確認
    expect(result_1.roi).toBeGreaterThanOrEqual(999999);
    expect(result_2.roi).toBeGreaterThanOrEqual(999999);
  });
});