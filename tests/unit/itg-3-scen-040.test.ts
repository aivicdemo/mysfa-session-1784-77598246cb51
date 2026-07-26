import { calculateMultiYearCostSimulation } from "../../src/logic/it-1-br-1784969812908-1-1-1";

describe("Salesforce ライセンス利用状況の可視化機能", () => {
  // SCEN-040
  test("複数年度コスト削減シミュレーション機能 - 初期構築コストが1年目のみ加算され、2年目以降は年間保守費用のみが計上される", () => {
    const initialConstructionCost = 100000;
    const annualMaintenanceCost = 50000;
    const simulationYears = 3;

    const result = calculateMultiYearCostSimulation({
      initialConstructionCost,
      annualMaintenanceCost,
      simulationYears,
    });

    // 1年目のコスト合計: 初期構築コスト + 年間保守費用
    expect(result.yearlyBreakdown[0].totalCost).toBe(150000);
    expect(result.yearlyBreakdown[0].initialConstructionCost).toBe(100000);
    expect(result.yearlyBreakdown[0].annualMaintenanceCost).toBe(50000);
    expect(result.yearlyBreakdown[0].year).toBe(1);

    // 2年目のコスト合計: 年間保守費用のみ
    expect(result.yearlyBreakdown[1].totalCost).toBe(50000);
    expect(result.yearlyBreakdown[1].initialConstructionCost).toBe(0);
    expect(result.yearlyBreakdown[1].annualMaintenanceCost).toBe(50000);
    expect(result.yearlyBreakdown[1].year).toBe(2);

    // 3年目のコスト合計: 年間保守費用のみ
    expect(result.yearlyBreakdown[2].totalCost).toBe(50000);
    expect(result.yearlyBreakdown[2].initialConstructionCost).toBe(0);
    expect(result.yearlyBreakdown[2].annualMaintenanceCost).toBe(50000);
    expect(result.yearlyBreakdown[2].year).toBe(3);

    // 3年度累計コスト
    expect(result.cumulativeTotalCost).toBe(250000);

    // 累積コストの検証
    expect(result.cumulativeCostByYear[0]).toBe(150000);
    expect(result.cumulativeCostByYear[1]).toBe(200000);
    expect(result.cumulativeCostByYear[2]).toBe(250000);
  });
});