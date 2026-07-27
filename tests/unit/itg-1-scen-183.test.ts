import { aggregateDealProgressByCustomer } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-183: [edge] 顧客別商談進捗集計機能 - 提案中ステータスの商談合計金額が0円のとき、その金額が0として集計される
  test("should aggregate deal progress by customer with zero amount for proposal status", () => {
    const customerId = "CUST-001";
    const deals = [
      {
        id: "DEAL-001",
        customerId: customerId,
        status: "提案中",
        amount: 0,
      },
      {
        id: "DEAL-002",
        customerId: customerId,
        status: "受注",
        amount: 500000,
      },
      {
        id: "DEAL-003",
        customerId: customerId,
        status: "失注",
        amount: 200000,
      },
    ];

    const result = aggregateDealProgressByCustomer(customerId, deals);

    expect(result).toEqual({
      customerId: customerId,
      progressByStatus: {
        初期接触: {
          count: 0,
          totalAmount: 0,
        },
        提案中: {
          count: 1,
          totalAmount: 0,
        },
        交渉中: {
          count: 0,
          totalAmount: 0,
        },
        受注: {
          count: 1,
          totalAmount: 500000,
        },
        失注: {
          count: 1,
          totalAmount: 200000,
        },
      },
    });

    expect(result.progressByStatus.提案中.totalAmount).toBe(0);
    expect(result.progressByStatus.受注.totalAmount).toBe(500000);
    expect(result.progressByStatus.失注.totalAmount).toBe(200000);
  });
});