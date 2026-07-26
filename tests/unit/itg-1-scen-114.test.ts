import { aggregateMonthlySalesMetrics } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  test("SCEN-114: 月次営業成績自動計算機能 - 当月の複数商談から売上合計、受注件数、進捗率が正しく計算される", () => {
    // テストデータ：当月の複数商談レコード
    const dealRecords = [
      {
        dealId: "DEAL001",
        customerId: "CUST001",
        dealAmount: 1000000,
        status: "受注",
        createdDate: "2024-04-05T10:00:00Z",
      },
      {
        dealId: "DEAL002",
        customerId: "CUST002",
        dealAmount: 500000,
        status: "受注",
        createdDate: "2024-04-10T14:30:00Z",
      },
      {
        dealId: "DEAL003",
        customerId: "CUST003",
        dealAmount: 750000,
        status: "提案中",
        createdDate: "2024-04-15T09:15:00Z",
      },
      {
        dealId: "DEAL004",
        customerId: "CUST004",
        dealAmount: 300000,
        status: "受注",
        createdDate: "2024-04-20T16:45:00Z",
      },
      {
        dealId: "DEAL005",
        customerId: "CUST005",
        dealAmount: 200000,
        status: "初期接触",
        createdDate: "2024-04-25T11:20:00Z",
      },
    ];

    const targetMonth = "2024-04";

    // 関数実行
    const result = aggregateMonthlySalesMetrics(dealRecords, targetMonth);

    // 期待値の計算
    // 売上合計：全商談の金額合計 = 1,000,000 + 500,000 + 750,000 + 300,000 + 200,000 = 2,750,000
    const expectedTotalSales = 2750000;

    // 受注件数：status が「受注」の商談件数 = 3件（DEAL001, DEAL002, DEAL004）
    const expectedClosedDealsCount = 3;

    // 提案数：全商談件数 = 5件
    const expectedProposalCount = 5;

    // 進捗率：受注件数 ÷ 提案数 = 3 ÷ 5 = 0.60（小数第2位まで）
    const expectedProgressRate = 0.6;

    // 検証：売上合計
    expect(result.totalSales).toBe(expectedTotalSales);

    // 検証：受注件数
    expect(result.closedDealsCount).toBe(expectedClosedDealsCount);

    // 検証：提案数
    expect(result.proposalCount).toBe(expectedProposalCount);

    // 検証：進捗率（小数第2位まで）
    expect(result.progressRate).toBeCloseTo(expectedProgressRate, 2);

    // 検証：計算値の型と構造
    expect(typeof result.totalSales).toBe("number");
    expect(typeof result.closedDealsCount).toBe("number");
    expect(typeof result.proposalCount).toBe("number");
    expect(typeof result.progressRate).toBe("number");

    // 検証：すべての計算値が正の数
    expect(result.totalSales).toBeGreaterThan(0);
    expect(result.closedDealsCount).toBeGreaterThan(0);
    expect(result.proposalCount).toBeGreaterThan(0);
    expect(result.progressRate).toBeGreaterThan(0);

    // 検証：進捗率が0以上1以下
    expect(result.progressRate).toBeLessThanOrEqual(1);

    // 検証：受注件数が提案数以下
    expect(result.closedDealsCount).toBeLessThanOrEqual(result.proposalCount);

    // 検証：タイムスタンプが存在（保存時刻）
    expect(result.calculatedAt).toBeDefined();
    expect(typeof result.calculatedAt).toBe("string");
  });
});