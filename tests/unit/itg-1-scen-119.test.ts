import { classifyDealsByStatusAndAggregateMetrics } from "../../src/logic/it-1";

describe("顧客別商談進捗分類機能", () => {
  // SCEN-119
  test("ステータス別の件数と合計金額が正確に集計される", () => {
    const mockDealsData = [
      {
        customerId: "CUST_001",
        dealId: "DEAL_001",
        dealStatus: "初期接触",
        dealAmount: 100000,
      },
      {
        customerId: "CUST_001",
        dealId: "DEAL_002",
        dealStatus: "提案中",
        dealAmount: 250000,
      },
      {
        customerId: "CUST_001",
        dealId: "DEAL_003",
        dealStatus: "提案中",
        dealAmount: 150000,
      },
      {
        customerId: "CUST_001",
        dealId: "DEAL_004",
        dealStatus: "交渉中",
        dealAmount: 300000,
      },
      {
        customerId: "CUST_001",
        dealId: "DEAL_005",
        dealStatus: "受注",
        dealAmount: 500000,
      },
      {
        customerId: "CUST_001",
        dealId: "DEAL_006",
        dealStatus: "失注",
        dealAmount: 200000,
      },
      {
        customerId: "CUST_002",
        dealId: "DEAL_007",
        dealStatus: "初期接触",
        dealAmount: 80000,
      },
      {
        customerId: "CUST_002",
        dealId: "DEAL_008",
        dealStatus: "提案中",
        dealAmount: 320000,
      },
      {
        customerId: "CUST_002",
        dealId: "DEAL_009",
        dealStatus: "交渉中",
        dealAmount: 180000,
      },
      {
        customerId: "CUST_002",
        dealId: "DEAL_010",
        dealStatus: "受注",
        dealAmount: 450000,
      },
    ];

    const result = classifyDealsByStatusAndAggregateMetrics(mockDealsData);

    // 顧客CUST_001の集計結果検証
    expect(result["CUST_001"]).toBeDefined();
    expect(result["CUST_001"]["初期接触"]).toEqual({
      count: 1,
      totalAmount: 100000,
    });
    expect(result["CUST_001"]["提案中"]).toEqual({
      count: 2,
      totalAmount: 400000,
    });
    expect(result["CUST_001"]["交渉中"]).toEqual({
      count: 1,
      totalAmount: 300000,
    });
    expect(result["CUST_001"]["受注"]).toEqual({
      count: 1,
      totalAmount: 500000,
    });
    expect(result["CUST_001"]["失注"]).toEqual({
      count: 1,
      totalAmount: 200000,
    });

    // 顧客CUST_002の集計結果検証
    expect(result["CUST_002"]).toBeDefined();
    expect(result["CUST_002"]["初期接触"]).toEqual({
      count: 1,
      totalAmount: 80000,
    });
    expect(result["CUST_002"]["提案中"]).toEqual({
      count: 1,
      totalAmount: 320000,
    });
    expect(result["CUST_002"]["交渉中"]).toEqual({
      count: 1,
      totalAmount: 180000,
    });
    expect(result["CUST_002"]["受注"]).toEqual({
      count: 1,
      totalAmount: 450000,
    });

    // ステータスが存在しない場合は undefined で処理されることを確認
    expect(result["CUST_002"]["失注"]).toBeUndefined();

    // 複数顧客のデータが混在した場合の独立性を確認
    expect(Object.keys(result)).toHaveLength(2);
    expect(Object.keys(result)).toContain("CUST_001");
    expect(Object.keys(result)).toContain("CUST_002");

    // CUST_001の全ステータス合計金額: 100000 + 400000 + 300000 + 500000 + 200000 = 1500000
    const cust001TotalAmount = Object.values(result["CUST_001"]).reduce(
      (sum: number, statusData: any) => sum + statusData.totalAmount,
      0
    );
    expect(cust001TotalAmount).toBe(1500000);

    // CUST_002の全ステータス合計金額: 80000 + 320000 + 180000 + 450000 = 1030000
    const cust002TotalAmount = Object.values(result["CUST_002"]).reduce(
      (sum: number, statusData: any) => sum + statusData.totalAmount,
      0
    );
    expect(cust002TotalAmount).toBe(1030000);

    // CUST_001の全ステータス件数: 1 + 2 + 1 + 1 + 1 = 6
    const cust001TotalCount = Object.values(result["CUST_001"]).reduce(
      (sum: number, statusData: any) => sum + statusData.count,
      0
    );
    expect(cust001TotalCount).toBe(6);

    // CUST_002の全ステータス件数: 1 + 1 + 1 + 1 = 4
    const cust002TotalCount = Object.values(result["CUST_002"]).reduce(
      (sum: number, statusData: any) => sum + statusData.count,
      0
    );
    expect(cust002TotalCount).toBe(4);
  });
});