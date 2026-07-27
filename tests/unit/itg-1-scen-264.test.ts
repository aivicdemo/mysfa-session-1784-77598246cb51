import { validateQuoteOrderInvoiceContent } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け - 帳票内容検証", () => {
  test("SCEN-264: 商談金額が小数を含む場合、警告を表示する", () => {
    const deal_record = {
      deal_id: "DEAL-001",
      customer_name: "テスト顧客",
      deal_amount: 150000.50,
      deal_status: "受注",
      quote_items: [
        {
          item_id: "ITEM-001",
          item_name: "商品A",
          unit_price: 50000.25,
          quantity: 3,
        },
      ],
    };

    const validation_result = validateQuoteOrderInvoiceContent(deal_record);

    expect(validation_result.has_decimal_warning).toBe(true);
    expect(validation_result.warning_message).toMatch(/小数/);
    expect(validation_result.warning_message).toMatch(/四捨五入|切り上げ/);
    expect(validation_result.rounded_amount).toBe(150001);
    expect(validation_result.is_approvable).toBe(true);
  });
});