import { identifyUnbilledDealsByStatus } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-919: [normal] 売上実績・請求データ照合機能 - 商談ステータスが「受注」でも請求書が未発行の場合、未請求案件として特定される
  test("商談ステータスが受注でも請求書が未発行の場合、未請求案件として特定される", () => {
    const dealRecords = [
      {
        dealId: "DEAL-001",
        customerName: "テスト顧客A",
        dealAmount: 500000,
        dealStatus: "受注",
        contractDate: "2024-01-15",
      },
    ];

    const invoiceRecords = [];

    const result = identifyUnbilledDealsByStatus(dealRecords, invoiceRecords);

    expect(result.unbilledDeals).toHaveLength(1);
    expect(result.unbilledDeals[0]).toEqual({
      dealId: "DEAL-001",
      customerName: "テスト顧客A",
      dealAmount: 500000,
      dealStatus: "受注",
      invoiceStatus: "未発行",
      reconciliationResult: "未請求",
      contractDate: "2024-01-15",
    });
  });
});