import { validateInvoiceTargetData } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-208
  test("請求対象データ妥当性検証 - 必須項目が全て完全に入力された請求対象データが承認可能と判定される", () => {
    const invoiceTargetData = {
      customerName: "株式会社ABC",
      invoiceAmount: 100000,
      invoiceDate: "2024-01-15",
      paymentDeadline: "2024-02-15",
      invoiceContent: "システム導入サービス一式",
      taxRate: 0.1,
    };

    const result = validateInvoiceTargetData(invoiceTargetData);

    expect(result).toBe(true);
  });
});