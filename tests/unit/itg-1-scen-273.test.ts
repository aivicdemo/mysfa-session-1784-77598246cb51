import {
  linkDealWithInvoice,
} from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-273
  test("商談ステータスが『完了』に更新されたとき、対応する請求書が1件存在し、請求金額と商談金額が完全一致する場合、紐付けが正常に成立する", () => {
    const deal_id = "DEAL-001";
    const invoice_id = "INV-001";
    const deal_amount = 1000000;
    const invoice_amount = 1000000;
    const deal_status = "完了";
    const invoice_status = "未発行";

    const input_deal = {
      deal_id: deal_id,
      amount: deal_amount,
      status: deal_status,
    };

    const input_invoices = [
      {
        invoice_id: invoice_id,
        amount: invoice_amount,
        status: invoice_status,
        deal_id: null,
      },
    ];

    const result = linkDealWithInvoice(input_deal, input_invoices);

    expect(result.deal_id).toBe(deal_id);
    expect(result.linked_invoice_id).toBe(invoice_id);
    expect(result.link_status).toBe("正常");
    expect(result.amount_match).toBe(true);
    expect(result.deal_amount).toBe(1000000);
    expect(result.invoice_amount).toBe(1000000);

    expect(result.updated_deal).toEqual({
      deal_id: deal_id,
      amount: deal_amount,
      status: deal_status,
      linked_invoice_id: invoice_id,
      link_status: "正常",
    });

    expect(result.updated_invoice).toEqual({
      invoice_id: invoice_id,
      amount: invoice_amount,
      status: invoice_status,
      linked_deal_id: deal_id,
    });

    expect(result.match_count).toBe(1);
  });
});