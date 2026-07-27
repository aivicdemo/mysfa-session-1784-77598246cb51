import { checkDealInvoiceAlignment } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-548
  test("商談レコードの請求書発行状況フィールドが欠けているとき処理が失敗する", () => {
    const dealRecordWithMissingInvoiceStatus = {
      deal_id: "DEAL-001",
      customer_id: "CUST-001",
      deal_status: "クローズ済み（成約）",
      deal_amount: 1000000,
      expected_invoice_date: new Date("2024-04-15T00:00:00Z"),
      reconciliation_status: "未処理"
    };

    expect(() =>
      checkDealInvoiceAlignment(dealRecordWithMissingInvoiceStatus)
    ).toThrow(/invoiceStatus/);
  });
});