import { generateMonthlyRevenueReport } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-326
  test("月次決算レポート生成機能 - 商談レコードの売上金額が負数のとき、そのまま集計に含まれる", () => {
    const targetYear = 2024;
    const targetMonth = 4;

    const dealRecords = [
      {
        dealId: "DEAL-001",
        revenue: -50000,
        status: "成約",
        month: 4,
        year: 2024,
      },
      {
        dealId: "DEAL-002",
        revenue: 100000,
        status: "成約",
        month: 4,
        year: 2024,
      },
      {
        dealId: "DEAL-003",
        revenue: 200000,
        status: "成約",
        month: 4,
        year: 2024,
      },
    ];

    const report = generateMonthlyRevenueReport(
      dealRecords,
      targetYear,
      targetMonth
    );

    const expectedTotalRevenue = -50000 + 100000 + 200000;

    expect(report.totalRevenue).toBe(expectedTotalRevenue);
    expect(report.totalRevenue).toBe(250000);
    expect(report.includedDealCount).toBe(3);
  });
});