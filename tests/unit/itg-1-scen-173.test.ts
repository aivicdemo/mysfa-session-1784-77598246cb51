import { aggregateDealProgressByCustomer } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-173
  test("顧客別商談進捗集計機能 - 交渉中ステータスの商談件数が複数件のとき、その件数が正確に集計される", () => {
    const customerId = "CUST-001";
    const deals = [
      {
        dealId: "DEAL-001",
        customerId: customerId,
        status: "交渉中",
        amount: 1000000,
      },
      {
        dealId: "DEAL-002",
        customerId: customerId,
        status: "交渉中",
        amount: 1500000,
      },
      {
        dealId: "DEAL-003",
        customerId: customerId,
        status: "交渉中",
        amount: 2000000,
      },
      {
        dealId: "DEAL-004",
        customerId: customerId,
        status: "提案済み",
        amount: 500000,
      },
      {
        dealId: "DEAL-005",
        customerId: customerId,
        status: "成約",
        amount: 3000000,
      },
    ];

    const result = aggregateDealProgressByCustomer(customerId, deals);

    expect(result.customerId).toBe("CUST-001");
    expect(result.statusBreakdown).toEqual(
      expect.objectContaining({
        交渉中: expect.objectContaining({
          count: 3,
          totalAmount: 4500000,
        }),
        提案済み: expect.objectContaining({
          count: 1,
          totalAmount: 500000,
        }),
        成約: expect.objectContaining({
          count: 1,
          totalAmount: 3000000,
        }),
      })
    );
    expect(result.statusBreakdown.交渉中.count).toBe(3);
    expect(result.statusBreakdown.交渉中.totalAmount).toBe(4500000);
    expect(result.statusBreakdown.提案済み.count).toBe(1);
    expect(result.statusBreakdown.提案済み.totalAmount).toBe(500000);
    expect(result.statusBreakdown.成約.count).toBe(1);
    expect(result.statusBreakdown.成約.totalAmount).toBe(3000000);
  });
});