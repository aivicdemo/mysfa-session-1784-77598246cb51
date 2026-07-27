import { classifyDealsByStatus } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-146
  test("当月商談ステータス分類機能 - 同じステータスを持つ複数商談が同じカテゴリとして集計される", () => {
    const testDeals = [
      {
        id: "deal_001",
        customerId: "cust_001",
        customerName: "ABC企業",
        status: "提案中",
        amount: 150000,
        dealDate: "2024-01-15",
      },
      {
        id: "deal_002",
        customerId: "cust_002",
        customerName: "XYZ企業",
        status: "提案中",
        amount: 200000,
        dealDate: "2024-01-20",
      },
      {
        id: "deal_003",
        customerId: "cust_003",
        customerName: "DEF企業",
        status: "提案中",
        amount: 100000,
        dealDate: "2024-01-25",
      },
    ];

    const periodStart = new Date("2024-01-01");
    const periodEnd = new Date("2024-01-31");

    const result = classifyDealsByStatus(testDeals, periodStart, periodEnd);

    expect(result).toEqual({
      classifications: [
        {
          status: "提案中",
          dealCount: 3,
          totalAmount: 450000,
          deals: [
            {
              id: "deal_001",
              customerId: "cust_001",
              customerName: "ABC企業",
              status: "提案中",
              amount: 150000,
              dealDate: "2024-01-15",
            },
            {
              id: "deal_002",
              customerId: "cust_002",
              customerName: "XYZ企業",
              status: "提案中",
              amount: 200000,
              dealDate: "2024-01-20",
            },
            {
              id: "deal_003",
              customerId: "cust_003",
              customerName: "DEF企業",
              status: "提案中",
              amount: 100000,
              dealDate: "2024-01-25",
            },
          ],
        },
      ],
      totalClassifications: 1,
      periodStart: "2024-01-01",
      periodEnd: "2024-01-31",
    });

    const proposalCategory = result.classifications.find(
      (cat) => cat.status === "提案中"
    );
    expect(proposalCategory).toBeDefined();
    expect(proposalCategory?.dealCount).toBe(3);
    expect(proposalCategory?.totalAmount).toBe(450000);
    expect(result.totalClassifications).toBe(1);
  });
});