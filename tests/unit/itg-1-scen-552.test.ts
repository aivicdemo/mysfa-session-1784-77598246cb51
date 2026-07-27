import {
  detectMismatchedDealStatusAndInvoice,
} from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-552
  test("ステータスが『受注』であっても請求書発行状況フィールドがnullのとき『未請求案件』として特定される", () => {
    const dealRecords = [
      {
        id: "deal-001",
        status: "受注",
        amount: 500000,
        invoiceIssuedDate: null,
        invoiceStatus: null,
      },
    ];

    const result = detectMismatchedDealStatusAndInvoice(dealRecords);

    expect(result.unmatchedDeals).toHaveLength(1);
    expect(result.unmatchedDeals[0]).toMatchObject({
      id: "deal-001",
      status: "受注",
      classification: "未請求案件",
      mismatchFlag: "ズレあり",
    });
  });
});