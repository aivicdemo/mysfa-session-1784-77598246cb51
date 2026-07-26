import { generateMonthlyReportWithCustomerDetails } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-127
  test("顧客別詳細がない場合も報告書が生成される", () => {
    const input = {
      year: 2024,
      month: 3,
      salesData: {
        totalRevenue: 1500000,
        orderCount: 5,
        progressRate: 0.6,
      },
      customerDetails: [],
      generatedAt: new Date("2024-03-31T23:59:59Z"),
    };

    const result = generateMonthlyReportWithCustomerDetails(input);

    expect(result).toEqual({
      reportId: expect.any(String),
      period: "2024-03",
      totalRevenue: 1500000,
      orderCount: 5,
      progressRate: 0.6,
      customerSection: "該当データなし",
      fileName: expect.stringMatching(/^monthly_report_2024_03_/),
      status: "generated",
      format: "PDF",
      layoutValid: true,
      dataComplete: true,
    });

    expect(result.reportId).toBeTruthy();
    expect(result.reportId.length).toBeGreaterThan(0);
    expect(result.fileName).toMatch(/\.pdf$/);
    expect(result.totalRevenue).toBe(1500000);
    expect(result.orderCount).toBe(5);
    expect(result.progressRate).toBe(0.6);
    expect(result.status).toBe("generated");
    expect(result.format).toBe("PDF");
    expect(result.layoutValid).toBe(true);
    expect(result.dataComplete).toBe(true);
  });
});