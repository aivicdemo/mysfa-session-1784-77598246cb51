import { generateMonthlyReportOnMissingField } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル - 商談情報参照機能", () => {
  // SCEN-046
  test("月次営業成績報告書生成機能 - 必須項目が1つ欠落している場合、報告書生成に失敗する", () => {
    const baseInput = {
      salespersonName: "山田太郎",
      salesAmount: 5000000,
      achievementRate: 85,
      reportMonth: "2024-01",
    };

    // Case 1: 営業員名が空の場合
    expect(() =>
      generateMonthlyReportOnMissingField({
        salespersonName: "",
        salesAmount: 5000000,
        achievementRate: 85,
        reportMonth: "2024-01",
      })
    ).toThrow(/営業員名/);

    // Case 2: 売上金額が空の場合
    expect(() =>
      generateMonthlyReportOnMissingField({
        salespersonName: "山田太郎",
        salesAmount: null as any,
        achievementRate: 85,
        reportMonth: "2024-01",
      })
    ).toThrow(/売上金額/);

    // Case 3: 達成率が空の場合
    expect(() =>
      generateMonthlyReportOnMissingField({
        salespersonName: "山田太郎",
        salesAmount: 5000000,
        achievementRate: null as any,
        reportMonth: "2024-01",
      })
    ).toThrow(/達成率/);

    // Case 4: 報告月が空の場合
    expect(() =>
      generateMonthlyReportOnMissingField({
        salespersonName: "山田太郎",
        salesAmount: 5000000,
        achievementRate: 85,
        reportMonth: "",
      })
    ).toThrow(/報告月/);

    // Case 5: すべて必須項目が揃っている場合は成功
    const result = generateMonthlyReportOnMissingField(baseInput);
    expect(result).toBeDefined();
    expect(result.salespersonName).toBe("山田太郎");
    expect(result.salesAmount).toBe(5000000);
    expect(result.achievementRate).toBe(85);
    expect(result.reportMonth).toBe("2024-01");
    expect(result.isGenerated).toBe(true);
  });
});