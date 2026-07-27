import { extractInvoiceDataByPeriod } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  // SCEN-773: [edge] 請求対象データ抽出機能 - 期間条件が終了日ちょうどのとき、該当データが抽出される
  test("should extract only invoice data matching the exact end date of the extraction period", () => {
    const testData = [
      {
        invoiceId: "INV-001",
        invoiceDate: new Date("2024-01-15"),
        periodStartDate: new Date("2024-01-01"),
        periodEndDate: new Date("2024-01-31"),
      },
      {
        invoiceId: "INV-002",
        invoiceDate: new Date("2024-02-10"),
        periodStartDate: new Date("2024-02-01"),
        periodEndDate: new Date("2024-02-29"),
      },
      {
        invoiceId: "INV-003",
        invoiceDate: new Date("2024-03-05"),
        periodStartDate: new Date("2024-03-01"),
        periodEndDate: new Date("2024-03-31"),
      },
    ];

    const extractionStartDate = new Date("2024-02-01");
    const extractionEndDate = new Date("2024-02-29");

    const result = extractInvoiceDataByPeriod(
      testData,
      extractionStartDate,
      extractionEndDate
    );

    expect(result).toHaveLength(1);
    expect(result[0].invoiceId).toBe("INV-002");
    expect(result[0].periodEndDate.toISOString()).toBe("2024-02-29T00:00:00.000Z");
  });
});