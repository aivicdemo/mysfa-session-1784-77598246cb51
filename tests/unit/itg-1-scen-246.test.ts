import { validateBillingTargetData } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  // SCEN-246
  test("請求対象データ妥当性検証機能 - 必須項目が欠落している商談データはエラーで拒否される", () => {
    const deal_data = {
      deal_id: "DEAL-2024-001",
      deal_name: "顧客A 10万円案件",
      customer_name: "",
      customer_id: "CUST-001",
      amount: 100000,
      invoice_date: "2024-04-15",
      line_items: [
        {
          item_id: "ITEM-001",
          item_name: "コンサルティングサービス",
          quantity: 1,
          unit_price: 100000,
          subtotal: 100000,
        },
      ],
    };

    expect(() => validateBillingTargetData(deal_data)).toThrow(/顧客名/);
  });
});