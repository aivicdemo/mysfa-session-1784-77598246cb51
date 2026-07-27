import { aggregateDealProgressByCustomer } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-192
  test("顧客別商談進捗集計機能 - 失注ステータスの商談合計金額が0円のとき、その金額が0として集計される", () => {
    const customerId = "CUST-001";
    const deals = [
      {
        dealId: "DEAL-001",
        customerId: customerId,
        status: "失注",
        amount: 0,
      },
      {
        dealId: "DEAL-002",
        customerId: customerId,
        status: "失注",
        amount: 0,
      },
      {
        dealId: "DEAL-003",
        customerId: customerId,
        status: "失注",
        amount: 0,
      },
      {
        dealId: "DEAL-004",
        customerId: customerId,
        status: "提案中",
        amount: 500000,
      },
      {
        dealId: "DEAL-005",
        customerId: customerId,
        status: "提案中",
        amount: 300000,
      },
      {
        dealId: "DEAL-006",
        customerId: customerId,
        status: "受注",
        amount: 1000000,
      },
      {
        dealId: "DEAL-007",
        customerId: customerId,
        status: "保留",
        amount: 200000,
      },
    ];

    const result = aggregateDealProgressByCustomer(customerId, deals);

    expect(result.customerId).toBe(customerId);
    expect(result.statusBreakdown).toBeDefined();

    const lostStatusBreakdown = result.statusBreakdown.find(
      (item: any) => item.status === "失注"
    );
    expect(lostStatusBreakdown).toBeDefined();
    expect(lostStatusBreakdown.totalAmount).toBe(0);
    expect(lostStatusBreakdown.dealCount).toBe(3);

    const proposalStatusBreakdown = result.statusBreakdown.find(
      (item: any) => item.status === "提案中"
    );
    expect(proposalStatusBreakdown).toBeDefined();
    expect(proposalStatusBreakdown.totalAmount).toBe(800000);
    expect(proposalStatusBreakdown.dealCount).toBe(2);

    const wonStatusBreakdown = result.statusBreakdown.find(
      (item: any) => item.status === "受注"
    );
    expect(wonStatusBreakdown).toBeDefined();
    expect(wonStatusBreakdown.totalAmount).toBe(1000000);
    expect(wonStatusBreakdown.dealCount).toBe(1);

    const holdStatusBreakdown = result.statusBreakdown.find(
      (item: any) => item.status === "保留"
    );
    expect(holdStatusBreakdown).toBeDefined();
    expect(holdStatusBreakdown.totalAmount).toBe(200000);
    expect(holdStatusBreakdown.dealCount).toBe(1);

    expect(result.totalDealCount).toBe(7);
    expect(result.grandTotalAmount).toBe(2000000);
  });
});