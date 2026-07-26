import { generateMonthlyReportWithValidation } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-125
  test("月次営業成績報告書生成機能 - 必須項目が不足している場合にエラーが発生する", () => {
    const validReport = {
      salesRepName: "田中太郎",
      reportMonth: "2024-04",
      salesAmount: 5000000,
      achievementRate: 85,
    };

    // ケース1: 営業担当者名が未入力
    expect(() =>
      generateMonthlyReportWithValidation({
        salesRepName: "",
        reportMonth: "2024-04",
        salesAmount: 5000000,
        achievementRate: 85,
      })
    ).toThrow(/営業担当者名/);

    // ケース2: 報告月が未入力
    expect(() =>
      generateMonthlyReportWithValidation({
        salesRepName: "田中太郎",
        reportMonth: "",
        salesAmount: 5000000,
        achievementRate: 85,
      })
    ).toThrow(/報告月/);

    // ケース3: 売上金額が未入力（0 または undefined）
    expect(() =>
      generateMonthlyReportWithValidation({
        salesRepName: "田中太郎",
        reportMonth: "2024-04",
        salesAmount: 0,
        achievementRate: 85,
      })
    ).toThrow(/売上金額/);

    // ケース4: 達成率が未入力（0 または undefined）
    expect(() =>
      generateMonthlyReportWithValidation({
        salesRepName: "田中太郎",
        reportMonth: "2024-04",
        salesAmount: 5000000,
        achievementRate: 0,
      })
    ).toThrow(/達成率/);

    // ケース5: すべての必須項目が正しく入力されている場合、報告書が正常に生成される
    const result = generateMonthlyReportWithValidation(validReport);
    expect(result).toEqual({
      reportId: expect.any(String),
      salesRepName: "田中太郎",
      reportMonth: "2024-04",
      salesAmount: 5000000,
      achievementRate: 85,
      status: "generated",
      generatedAt: expect.any(String),
    });
    expect(result.status).toBe("generated");
    expect(result.salesAmount).toBe(5000000);
    expect(result.achievementRate).toBe(85);
  });
});