import { classifyDealsCurrentMonth } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  test("SCEN-144: [normal] 当月商談ステータス分類機能 - 前月登録の商談は当月集計に含まれない", () => {
    // テスト用データベース初期化（フィクスチャ）
    const testDealRecords = [
      {
        dealId: "DEAL_A",
        customerId: "CUST_001",
        createdDate: new Date("2024-11-15"),
        status: "提案中",
        amount: 1000000,
      },
      {
        dealId: "DEAL_B",
        customerId: "CUST_002",
        createdDate: new Date("2024-11-20"),
        status: "受注",
        amount: 500000,
      },
      {
        dealId: "DEAL_C",
        customerId: "CUST_003",
        createdDate: new Date("2024-12-10"),
        status: "提案中",
        amount: 2000000,
      },
      {
        dealId: "DEAL_D",
        customerId: "CUST_004",
        createdDate: new Date("2024-12-18"),
        status: "受注",
        amount: 750000,
      },
    ];

    // 当月（2024年12月）の商談ステータス分類機能を実行
    const currentMonthDate = new Date("2024-12-15");
    const result = classifyDealsCurrentMonth(testDealRecords, currentMonthDate);

    // 期待結果の検証
    // 当月集計結果は商談レコードCとDのみを含む
    expect(result.totalDealsInCurrentMonth).toBe(2);

    // 「提案中」ステータスは件数1件・合計金額200万円
    const proposalStatus = result.statusGroups.find(
      (group) => group.status === "提案中"
    );
    expect(proposalStatus).toBeDefined();
    expect(proposalStatus?.count).toBe(1);
    expect(proposalStatus?.totalAmount).toBe(2000000);

    // 「受注」ステータスは件数1件・合計金額75万円
    const wonStatus = result.statusGroups.find(
      (group) => group.status === "受注"
    );
    expect(wonStatus).toBeDefined();
    expect(wonStatus?.count).toBe(1);
    expect(wonStatus?.totalAmount).toBe(750000);

    // 前月登録の商談レコードAとBは集計に含まれないことを確認
    const allDealIds = result.statusGroups.flatMap((group) =>
      group.deals.map((deal) => deal.dealId)
    );
    expect(allDealIds).not.toContain("DEAL_A");
    expect(allDealIds).not.toContain("DEAL_B");
    expect(allDealIds).toContain("DEAL_C");
    expect(allDealIds).toContain("DEAL_D");
  });
});