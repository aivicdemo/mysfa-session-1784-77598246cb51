import { approveInvoice } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-251: [edge] 請求書承認検証機能 - 金額が0円の請求書を承認時に検出してエラーを返す
  test("金額が0円の請求書を承認しようとする場合、バリデーションエラーが発生する", () => {
    const invoice_data = {
      invoice_id: "INV-2024-001",
      customer_name: "テスト顧客株式会社",
      invoice_number: "2024-001",
      invoice_amount: 0,
      invoice_status: "draft",
      invoice_date: "2024-01-15",
      due_date: "2024-02-15",
    };

    expect(() => approveInvoice(invoice_data)).toThrow(/請求金額/);
  });
});