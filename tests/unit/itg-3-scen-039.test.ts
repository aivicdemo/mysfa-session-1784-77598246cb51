import {
  calculateMultiYearCostSavingsSimulation,
} from "../../src/logic/it-1-br-1784969812908-1-1-1";

describe("Salesforce ライセンス利用状況の可視化機能", () => {
  // SCEN-039
  test("複数年度コスト削減シミュレーション機能 - 1年目から5年目までの累積コストと年度別削減額が正確に算出される", () => {
    // シナリオ 1: 初期コスト 1,000,000 円、削減率 [5%, 10%, 15%, 20%, 25%]
    const initial_cost_1 = 1000000;
    const reduction_rates_1 = [0.05, 0.1, 0.15, 0.2, 0.25];

    const result_1 = calculateMultiYearCostSavingsSimulation(
      initial_cost_1,
      reduction_rates_1
    );

    // 年度別削減額の期待値
    // 1年目: 1,000,000 * 0.05 = 50,000
    // 2年目: 1,000,000 * 0.10 = 100,000
    // 3年目: 1,000,000 * 0.15 = 150,000
    // 4年目: 1,000,000 * 0.20 = 200,000
    // 5年目: 1,000,000 * 0.25 = 250,000
    const expected_yearly_savings_1 = [50000, 100000, 150000, 200000, 250000];

    // 累積コストの期待値（初期コストから各年度の削減額を引く）
    // 1年目: 1,000,000 - 50,000 = 950,000
    // 2年目: 950,000 - 100,000 = 850,000
    // 3年目: 850,000 - 150,000 = 700,000
    // 4年目: 700,000 - 200,000 = 500,000
    // 5年目: 500,000 - 250,000 = 250,000
    const expected_cumulative_cost_1 = [950000, 850000, 700000, 500000, 250000];

    // 累積削減額の期待値
    // 1年目: 50,000
    // 2年目: 50,000 + 100,000 = 150,000
    // 3年目: 150,000 + 150,000 = 300,000
    // 4年目: 300,000 + 200,000 = 500,000
    // 5年目: 500,000 + 250,000 = 750,000
    const expected_cumulative_savings_1 = [50000, 150000, 300000, 500000, 750000];

    expect(result_1.yearly_savings).toEqual(expected_yearly_savings_1);
    expect(result_1.cumulative_cost).toEqual(expected_cumulative_cost_1);
    expect(result_1.cumulative_savings).toEqual(expected_cumulative_savings_1);

    // シナリオ 2: 初期コスト 2,000,000 円、削減率 [5%, 10%, 15%, 20%, 25%]
    const initial_cost_2 = 2000000;
    const reduction_rates_2 = [0.05, 0.1, 0.15, 0.2, 0.25];

    const result_2 = calculateMultiYearCostSavingsSimulation(
      initial_cost_2,
      reduction_rates_2
    );

    // 年度別削減額の期待値
    // 1年目: 2,000,000 * 0.05 = 100,000
    // 2年目: 2,000,000 * 0.10 = 200,000
    // 3年目: 2,000,000 * 0.15 = 300,000
    // 4年目: 2,000,000 * 0.20 = 400,000
    // 5年目: 2,000,000 * 0.25 = 500,000
    const expected_yearly_savings_2 = [100000, 200000, 300000, 400000, 500000];

    // 累積コストの期待値
    // 1年目: 2,000,000 - 100,000 = 1,900,000
    // 2年目: 1,900,000 - 200,000 = 1,700,000
    // 3年目: 1,700,000 - 300,000 = 1,400,000
    // 4年目: 1,400,000 - 400,000 = 1,000,000
    // 5年目: 1,000,000 - 500,000 = 500,000
    const expected_cumulative_cost_2 = [1900000, 1700000, 1400000, 1000000, 500000];

    // 累積削減額の期待値
    // 1年目: 100,000
    // 2年目: 100,000 + 200,000 = 300,000
    // 3年目: 300,000 + 300,000 = 600,000
    // 4年目: 600,000 + 400,000 = 1,000,000
    // 5年目: 1,000,000 + 500,000 = 1,500,000
    const expected_cumulative_savings_2 = [100000, 300000, 600000, 1000000, 1500000];

    expect(result_2.yearly_savings).toEqual(expected_yearly_savings_2);
    expect(result_2.cumulative_cost).toEqual(expected_cumulative_cost_2);
    expect(result_2.cumulative_savings).toEqual(expected_cumulative_savings_2);

    // 結果が 5 年度分のデータを持つことを確認
    expect(result_1.yearly_savings.length).toBe(5);
    expect(result_1.cumulative_cost.length).toBe(5);
    expect(result_1.cumulative_savings.length).toBe(5);

    expect(result_2.yearly_savings.length).toBe(5);
    expect(result_2.cumulative_cost.length).toBe(5);
    expect(result_2.cumulative_savings.length).toBe(5);

    // 削減額が常に正の値であることを確認
    result_1.yearly_savings.forEach((saving) => {
      expect(saving).toBeGreaterThan(0);
    });

    result_2.yearly_savings.forEach((saving) => {
      expect(saving).toBeGreaterThan(0);
    });

    // 累積コストが逓減していることを確認
    for (let i = 1; i < result_1.cumulative_cost.length; i++) {
      expect(result_1.cumulative_cost[i]).toBeLessThan(result_1.cumulative_cost[i - 1]);
    }

    for (let i = 1; i < result_2.cumulative_cost.length; i++) {
      expect(result_2.cumulative_cost[i]).toBeLessThan(result_2.cumulative_cost[i - 1]);
    }

    // 累積削減額が逓増していることを確認
    for (let i = 1; i < result_1.cumulative_savings.length; i++) {
      expect(result_1.cumulative_savings[i]).toBeGreaterThan(
        result_1.cumulative_savings[i - 1]
      );
    }

    for (let i = 1; i < result_2.cumulative_savings.length; i++) {
      expect(result_2.cumulative_savings[i]).toBeGreaterThan(
        result_2.cumulative_savings[i - 1]
      );
    }
  });
});