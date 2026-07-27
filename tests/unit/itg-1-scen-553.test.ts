import {
  detectUnbilledDeals,
} from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-553
  test("ステータスが『受注』であっても請求書発行状況が『未発行』のとき『未請求案件』として特定される", () => {
    const dealRecords = [
      {
        dealId: "DEAL-001",
        dealStatus: "受注",
        customerName: "テスト顧客A",
        amount: 1000000,
        invoiceIssued: false,
      },
    ];

    const result = detectUnbilledDeals(dealRecords);

    expect(result.unbilledDeals).toHaveLength(1);
    expect(result.unbilledDeals[0]).toEqual({
      dealId: "DEAL-001",
      dealStatus: "受注",
      customerName: "テスト顧客A",
      amount: 1000000,
      discrepancy: "ステータス：受注 / 請求書発行状況：未発行",
      classificationStatus: "未請求案件",
    });
  });
});