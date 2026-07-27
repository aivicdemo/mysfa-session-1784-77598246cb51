import { validateDealContentForBilling } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  // SCEN-249
  test("帳票内容検証機能 - 商談金額が負の値の場合、警告を表示する", () => {
    const deal_amount = -100000;
    const customer_id = "CUST001";
    const customer_name = "テスト顧客";
    const deal_items = [
      {
        item_id: "ITEM001",
        item_name: "サービスA",
        unit_price: 50000,
        quantity: 2,
      },
    ];

    expect(() =>
      validateDealContentForBilling({
        deal_amount,
        customer_id,
        customer_name,
        deal_items,
      })
    ).toThrow(/商談金額/);
  });
});