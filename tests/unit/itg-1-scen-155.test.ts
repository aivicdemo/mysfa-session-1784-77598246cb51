import { verifyDealAndInvoiceAlignment } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-155
  test("商談の請求金額が商談金額と完全一致する場合、紐付けが正しいと判定される", () => {
    const deal_id = "DEAL-001";
    const deal_amount = 1000000;
    const invoice_amount = 1000000;
    const deal_status = "受注";
    const invoice_issue_date = new Date("2024-04-15T09:00:00Z");
    const invoice_planned_date = new Date("2024-04-15T09:00:00Z");

    const input = {
      deal_id,
      deal_amount,
      deal_status,
      invoice_amount,
      invoice_issue_date,
      invoice_planned_date,
    };

    const result = verifyDealAndInvoiceAlignment(input);

    expect(result.alignment_status).toBe("正常");
    expect(result.deal_amount).toBe(1000000);
    expect(result.invoice_amount).toBe(1000000);
    expect(result.amount_difference).toBe(0);
    expect(result.is_aligned).toBe(true);
    expect(result.deal_id).toBe("DEAL-001");
  });
});