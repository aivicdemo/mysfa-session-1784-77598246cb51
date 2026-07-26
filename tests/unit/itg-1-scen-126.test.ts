import { updateDealStatusToClose } from "../../src/logic/it-1784969823049-2-1-1";

describe("商談レコードの進捗ステータスと提案内容の入力・保存機能", () => {
  // SCEN-126
  test("顧客情報が未入力の商談を『成約』に更新すると拒否される", () => {
    const deal_record = {
      deal_id: "DEAL-001",
      customer_id: undefined,
      customer_name: undefined,
      status: "提案中",
      amount: 500000,
      line_items: [
        {
          line_item_id: "LINE-001",
          product_name: "製品A",
          quantity: 2,
          unit_price: 250000,
        },
      ],
    };

    expect(() =>
      updateDealStatusToClose({
        deal_id: deal_record.deal_id,
        customer_id: deal_record.customer_id,
        customer_name: deal_record.customer_name,
        status: "成約",
        amount: deal_record.amount,
        line_items: deal_record.line_items,
      })
    ).toThrow(/顧客情報/);
  });
});