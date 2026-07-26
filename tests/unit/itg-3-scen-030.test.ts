import { calculateInitialConstructionCost } from "../../src/logic/it-1-br-1784969812908-1-1-1";

describe("Salesforce ライセンス利用状況の可視化機能", () => {
  // SCEN-030
  test("[normal] 初期構築コスト算出機能 - 開発規模・工数・人員配置から初期構築コストが正確に算出される", () => {
    // Arrange: 開発規模「大規模」、プロジェクト工数「500人日」、人員配置「SE 3名、開発者 5名、テスト者 2名」
    const input_scale = "large";
    const input_total_person_days = 500;
    const input_se_count = 3;
    const input_developer_count = 5;
    const input_tester_count = 2;
    const input_se_unit_price = 15000;
    const input_developer_unit_price = 12000;
    const input_tester_unit_price = 10000;

    // 手動計算による期待値
    // SE工数: 500 * (3 / 10) = 150人日, コスト: 150 * 15,000 = 2,250,000円
    // 開発者工数: 500 * (5 / 10) = 250人日, コスト: 250 * 12,000 = 3,000,000円
    // テスト者工数: 500 * (2 / 10) = 100人日, コスト: 100 * 10,000 = 1,000,000円
    // 合計: 2,250,000 + 3,000,000 + 1,000,000 = 6,250,000円
    const expected_se_person_days = 150;
    const expected_se_cost = 2250000;
    const expected_developer_person_days = 250;
    const expected_developer_cost = 3000000;
    const expected_tester_person_days = 100;
    const expected_tester_cost = 1000000;
    const expected_total_initial_cost = 6250000;

    // Act
    const result = calculateInitialConstructionCost({
      scale: input_scale,
      total_person_days: input_total_person_days,
      team_composition: {
        se_count: input_se_count,
        developer_count: input_developer_count,
        tester_count: input_tester_count,
      },
      unit_prices: {
        se_daily_rate: input_se_unit_price,
        developer_daily_rate: input_developer_unit_price,
        tester_daily_rate: input_tester_unit_price,
      },
    });

    // Assert: 算出結果の内訳と合計が正確に表示されることを検証
    expect(result.breakdown.se_person_days).toBe(expected_se_person_days);
    expect(result.breakdown.se_cost).toBe(expected_se_cost);
    expect(result.breakdown.developer_person_days).toBe(
      expected_developer_person_days
    );
    expect(result.breakdown.developer_cost).toBe(expected_developer_cost);
    expect(result.breakdown.tester_person_days).toBe(expected_tester_person_days);
    expect(result.breakdown.tester_cost).toBe(expected_tester_cost);
    expect(result.total_initial_construction_cost).toBe(
      expected_total_initial_cost
    );

    // Assert: 開発規模が大規模に設定されていることを確認
    expect(result.scale).toBe("large");

    // Assert: 人員配置が正しく反映されていることを確認
    expect(result.team_composition.se_count).toBe(input_se_count);
    expect(result.team_composition.developer_count).toBe(
      input_developer_count
    );
    expect(result.team_composition.tester_count).toBe(input_tester_count);

    // Assert: プロジェクト工数が500人日に設定されていることを確認
    expect(result.total_person_days).toBe(input_total_person_days);

    // Assert: 単価が正しく設定されていることを確認
    expect(result.unit_prices.se_daily_rate).toBe(input_se_unit_price);
    expect(result.unit_prices.developer_daily_rate).toBe(
      input_developer_unit_price
    );
    expect(result.unit_prices.tester_daily_rate).toBe(input_tester_unit_price);

    // Assert: 手動計算による期待値とシステムの算出値が完全に一致することを検証
    expect(result.total_initial_construction_cost).toBe(6250000);
  });
});