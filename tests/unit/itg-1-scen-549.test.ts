import { validateAndMatchDealWithInvoice } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-549
  test("商談レコードのIDフィールドが欠けているとき処理が失敗する", () => {
    const invalidDealRecord = {
      id: null,
      customerId: "CUST-001",
      amount: 100000,
      status: "受注",
      invoiceIssuedDate: "2024-04-15",
      invoiceAmount: 100000,
    };

    expect(() => validateAndMatchDealWithInvoice(invalidDealRecord)).toThrow(
      /商談レコードのID/
    );
  });
});