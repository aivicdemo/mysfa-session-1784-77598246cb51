import { extractSalesRevenueByPeriod } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  test("SCEN-948: 月次決算期間の開始日の売上実績が正しく抽出される", () => {
    // 月次決算期間の開始日を2024年1月1日に設定
    const periodStartDate = new Date("2024-01-01T00:00:00Z");

    // 売上実績テストデータ事前投入
    const salesRevenueData = [
      {
        id: "REV-001",
        recordedAt: new Date("2023-12-31T23:59:59Z"),
        amount: 50000,
        productId: "PROD-001",
      },
      {
        id: "REV-002",
        recordedAt: new Date("2024-01-01T00:00:00Z"),
        amount: 100000,
        productId: "PROD-002",
      },
      {
        id: "REV-003",
        recordedAt: new Date("2024-01-01T12:00:00Z"),
        amount: 75000,
        productId: "PROD-003",
      },
    ];

    // 月次決算期間の開始日を基準に売上実績を抽出
    const extractedRevenue = extractSalesRevenueByPeriod(
      salesRevenueData,
      periodStartDate
    );

    // 期待結果の検証
    // 抽出件数は2件であること
    expect(extractedRevenue).toHaveLength(2);

    // 抽出結果に2024年1月1日 00:00:00以降の売上実績のみが含まれていることを確認
    expect(extractedRevenue[0]).toEqual({
      id: "REV-002",
      recordedAt: new Date("2024-01-01T00:00:00Z"),
      amount: 100000,
      productId: "PROD-002",
    });

    expect(extractedRevenue[1]).toEqual({
      id: "REV-003",
      recordedAt: new Date("2024-01-01T12:00:00Z"),
      amount: 75000,
      productId: "PROD-003",
    });

    // 2023年12月31日の売上実績①は含まれていないこと
    const hasDecemberRecord = extractedRevenue.some(
      (record) => record.recordedAt < periodStartDate
    );
    expect(hasDecemberRecord).toBe(false);

    // 合計金額は175,000円であること
    const totalAmount = extractedRevenue.reduce(
      (sum, record) => sum + record.amount,
      0
    );
    expect(totalAmount).toBe(175000);
  });
});