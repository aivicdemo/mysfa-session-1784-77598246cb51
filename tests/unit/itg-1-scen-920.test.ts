import { identifyUnbilledCases } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-920
  test("売上実績・請求データ照合機能 - 商談ステータスが「完了」でも請求書が未発行の場合、未請求案件として特定される", () => {
    const salesRecord = {
      dealId: "DEAL-001",
      customerName: "テスト顧客A",
      dealStatus: "完了",
      salesAmount: 100000,
      salesDate: "2024-01-15",
    };

    const billingRecords = [];

    const reconciliationPeriod = {
      startDate: "2024-01-01",
      endDate: "2024-01-31",
    };

    const result = identifyUnbilledCases(
      [salesRecord],
      billingRecords,
      reconciliationPeriod
    );

    expect(result).toEqual({
      unbilledCases: [
        {
          dealId: "DEAL-001",
          customerName: "テスト顧客A",
          dealStatus: "完了",
          salesAmount: 100000,
          salesDate: "2024-01-15",
          invoiceStatus: "未発行",
          caseClassification: "未請求",
        },
      ],
      delayedCases: [],
      totalUnbilledAmount: 100000,
    });
  });
});