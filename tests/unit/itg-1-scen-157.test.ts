import { aggregateMonthlySalesResults } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  test("SCEN-157: [edge] 当月集計結果の月判定 - 月初日に登録された商談が当月集計に含まれる", () => {
    // 基準日時を月初日に設定
    const baseDate = new Date("2024-01-01T00:00:00Z");
    const aggregationStartDate = new Date("2024-01-01T00:00:00Z");
    const aggregationEndDate = new Date("2024-01-31T23:59:59Z");

    // 当月集計対象の商談データ
    const dealAtMonthStart = {
      dealId: "DEAL001",
      customerName: "テスト顧客A",
      dealAmount: 100000,
      status: "進行中",
      registeredAt: new Date("2024-01-01T09:30:00Z"),
    };

    const dealAtMonthEnd = {
      dealId: "DEAL002",
      customerName: "テスト顧客B",
      dealAmount: 50000,
      status: "進行中",
      registeredAt: new Date("2024-01-01T23:59:59Z"),
    };

    const dealFromPreviousMonth = {
      dealId: "DEAL003",
      customerName: "テスト顧客C",
      dealAmount: 200000,
      status: "進行中",
      registeredAt: new Date("2023-12-31T23:59:59Z"),
    };

    // テスト対象の商談一覧
    const allDeals = [
      dealAtMonthStart,
      dealAtMonthEnd,
      dealFromPreviousMonth,
    ];

    // 月集計処理を実行
    const aggregationResult = aggregateMonthlySalesResults({
      deals: allDeals,
      aggregationStartDate,
      aggregationEndDate,
      referenceDate: baseDate,
    });

    // 期待結果: 当月に登録された2件の商談が含まれ、売上合計が150,000円
    expect(aggregationResult.includedDeals).toHaveLength(2);
    expect(aggregationResult.includedDeals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dealId: "DEAL001",
          customerName: "テスト顧客A",
        }),
        expect.objectContaining({
          dealId: "DEAL002",
          customerName: "テスト顧客B",
        }),
      ])
    );

    // 売上合計が150,000円
    expect(aggregationResult.totalSalesAmount).toBe(150000);

    // 前月登録の商談は集計結果に含まれていない
    expect(aggregationResult.includedDeals).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dealId: "DEAL003",
          customerName: "テスト顧客C",
        }),
      ])
    );

    // 件数確認
    expect(aggregationResult.dealCount).toBe(2);
  });
});