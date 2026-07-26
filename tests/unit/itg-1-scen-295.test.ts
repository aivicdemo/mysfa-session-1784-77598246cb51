import { calculateCumulativeCostWithRounding } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-295
  test("複数年度コスト比較・ROI計算機能 - 5年目の累積コスト計算時に小数点以下の丸め処理が統一される", () => {
    // 初期投資額: 100,000円
    // 年間運用コスト: 12,345.6789円
    // 計算対象年数: 5年
    // 期待される計算結果（四捨五入、小数点以下第2位まで）:
    // 1年目: 100,000 + 12,345.68 = 112,345.68
    // 2年目: 112,345.68 + 12,345.68 = 124,691.36
    // 3年目: 124,691.36 + 12,345.68 = 137,037.04
    // 4年目: 137,037.04 + 12,345.68 = 149,382.72
    // 5年目: 149,382.72 + 12,345.68 = 161,728.40

    const initialInvestment = 100000;
    const annualOperatingCost = 12345.6789;
    const years = 5;

    // 初回計算
    const result1 = calculateCumulativeCostWithRounding({
      initialInvestment,
      annualOperatingCost,
      years,
    });

    expect(result1).toBe(161728.4);

    // 複数回同じ条件で計算し、一貫性を検証
    const result2 = calculateCumulativeCostWithRounding({
      initialInvestment,
      annualOperatingCost,
      years,
    });

    expect(result2).toBe(161728.4);
    expect(result1).toBe(result2);

    // 異なる小数点以下のパターンをテスト
    // パターン1: 0.1円
    const costPattern1 = 12345.1;
    const resultPattern1 = calculateCumulativeCostWithRounding({
      initialInvestment,
      annualOperatingCost: costPattern1,
      years,
    });

    // 期待値: 100,000 + (12,345.1 * 5) = 100,000 + 61,725.5 = 161,725.5
    expect(resultPattern1).toBe(161725.5);

    // パターン2: 0.05円
    const costPattern2 = 12345.05;
    const resultPattern2 = calculateCumulativeCostWithRounding({
      initialInvestment,
      annualOperatingCost: costPattern2,
      years,
    });

    // 期待値: 100,000 + (12,345.05 * 5) = 100,000 + 61,725.25 = 161,725.25
    expect(resultPattern2).toBe(161725.25);

    // パターン3: 0.001円
    const costPattern3 = 12345.001;
    const resultPattern3 = calculateCumulativeCostWithRounding({
      initialInvestment,
      annualOperatingCost: costPattern3,
      years,
    });

    // 期待値: 100,000 + (12,345.001 * 5) = 100,000 + 61,725.005 ≈ 161,725.01（四捨五入）
    expect(resultPattern3).toBe(161725.01);

    // 異なる年数での一貫性確認
    const result3Years = calculateCumulativeCostWithRounding({
      initialInvestment,
      annualOperatingCost,
      years: 3,
    });

    // 3年目の期待値: 100,000 + (12,345.6789 * 3) = 100,000 + 37,037.04 = 137,037.04
    expect(result3Years).toBe(137037.04);

    // 複数回の計算で同じ結果が得られることを確認
    const result3YearsSecond = calculateCumulativeCostWithRounding({
      initialInvestment,
      annualOperatingCost,
      years: 3,
    });

    expect(result3Years).toBe(result3YearsSecond);

    // より大きい小数点以下の精度を持つコストでのテスト
    const costHighPrecision = 12345.6789123456;
    const resultHighPrecision = calculateCumulativeCostWithRounding({
      initialInvestment,
      annualOperatingCost: costHighPrecision,
      years,
    });

    // 期待値: 100,000 + (12,345.6789123456 * 5) ≈ 161,728.40（四捨五入後）
    expect(resultHighPrecision).toBe(161728.4);
  });
});