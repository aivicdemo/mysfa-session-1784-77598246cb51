import { updateDealStatusToClosedAndLinkInvoice } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  // SCEN-236
  test("商談ステータスを成約に変更する際、請求データ紐付けで請求書発行日が今日の日付で設定される", () => {
    const todayISO = "2024-01-15T00:00:00Z";
    const todayDate = new Date(todayISO);

    const dealRecord = {
      deal_id: "DEAL-001",
      customer_id: "CUST-001",
      customer_name: "テスト顧客",
      current_status: "交渉中",
      deal_amount: 500000,
      deal_items: [
        {
          item_id: "ITEM-001",
          item_name: "商品A",
          quantity: 10,
          unit_price: 50000,
        },
      ],
    };

    const result = updateDealStatusToClosedAndLinkInvoice(dealRecord, todayDate);

    expect(result.deal_status).toBe("成約");
    expect(result.linked_invoice).toBeDefined();
    expect(result.linked_invoice.invoice_issue_date).toEqual(todayDate);
    expect(result.linked_invoice.customer_id).toBe("CUST-001");
    expect(result.linked_invoice.customer_name).toBe("テスト顧客");
    expect(result.linked_invoice.invoice_amount).toBe(500000);
    expect(result.linked_invoice.invoice_items).toHaveLength(1);
    expect(result.linked_invoice.invoice_items[0].item_name).toBe("商品A");
    expect(result.linked_invoice.invoice_items[0].quantity).toBe(10);
    expect(result.linked_invoice.invoice_items[0].unit_price).toBe(50000);
  });
});