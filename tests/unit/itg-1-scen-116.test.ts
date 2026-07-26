import { calculateMonthlySalesMetrics } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  test("SCEN-116: 当月売上集計機能 - 提案数と受注件数が同数の場合に進捗率が100%と算出される", () => {
    // Arrange: テストデータの準備
    const proposalCount = 5;
    const closedDealCount = 5;
    const totalRevenue = 1000000;

    // Act: 売上集計を実行
    const result = calculateMonthlySalesMetrics({
      proposals: proposalCount,
      closedDeals: closedDealCount,
      revenue: totalRevenue,
    });

    // Assert: 進捗率が100%と正確に算出されることを検証
    expect(result.progressRate).toBe(100);
    expect(result.proposalCount).toBe(5);
    expect(result.closedDealCount).toBe(5);
    expect(result.totalRevenue).toBe(1000000);

    // 進捗率の計算式: (受注件数 ÷ 提案数) × 100
    // 期待値: (5 ÷ 5) × 100 = 100%
    const expectedProgressRate = (closedDealCount / proposalCount) * 100;
    expect(result.progressRate).toBe(expectedProgressRate);
  });
});