import { getMonthlyOrderCount, getProgressNumerator } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-161
  test("当月受注件数と進捗率の整合性 - 受注件数の計算ロジックと進捗率分子の計算ロジックが同じ商談セットを参照する", () => {
    const currentMonth = "2024-01";

    const dealDataset = [
      {
        id: "deal_001",
        month: currentMonth,
        status: "受注",
        amount: 1000000,
      },
      {
        id: "deal_002",
        month: currentMonth,
        status: "受注",
        amount: 500000,
      },
      {
        id: "deal_003",
        month: currentMonth,
        status: "提案中",
        amount: 300000,
      },
    ];

    const monthlyOrderCount = getMonthlyOrderCount(dealDataset, currentMonth);
    const progressNumerator = getProgressNumerator(dealDataset, currentMonth);

    expect(monthlyOrderCount).toBe(2);

    expect(progressNumerator).toBe(2);

    expect(monthlyOrderCount).toBe(progressNumerator);

    const orderCountFilteredDeals = dealDataset.filter(
      (deal) => deal.month === currentMonth && deal.status === "受注"
    );
    expect(orderCountFilteredDeals.length).toBe(2);

    const progressNumeratorFilteredDeals = dealDataset.filter(
      (deal) => deal.month === currentMonth && deal.status === "受注"
    );
    expect(progressNumeratorFilteredDeals.length).toBe(2);

    expect(orderCountFilteredDeals).toEqual(progressNumeratorFilteredDeals);
  });
});