import { updateDealStatusToContracted } from "../../src/logic/it-1784969823049-2-1-1";

describe("商談レコードの進捗ステータスと提案内容の入力・保存機能", () => {
  // SCEN-128: [edge] 商談ステータス更新・請求データ紐付け機能 - 金額が0円またはnullの商談を『成約』に更新すると拒否される
  test("金額が0円またはnullの商談を『成約』に更新しようとすると拒否される", () => {
    // 金額が0円の商談ステータス更新
    const deal_zero_amount = {
      deal_id: "DEAL-001",
      customer_id: "CUST-001",
      current_status: "提案中",
      amount: 0,
      target_status: "成約",
      details: [
        {
          product_id: "PROD-001",
          product_name: "商品A",
          quantity: 1,
          unit_price: 0,
        },
      ],
    };

    expect(() =>
      updateDealStatusToContracted(deal_zero_amount)
    ).toThrow(/金額が0円/);

    // 金額がnullの商談ステータス更新
    const deal_null_amount = {
      deal_id: "DEAL-002",
      customer_id: "CUST-002",
      current_status: "提案中",
      amount: null,
      target_status: "成約",
      details: [
        {
          product_id: "PROD-002",
          product_name: "商品B",
          quantity: 1,
          unit_price: null,
        },
      ],
    };

    expect(() =>
      updateDealStatusToContracted(deal_null_amount)
    ).toThrow(/金額がnull/);

    // 正常系：金額が正の値の場合、ステータス更新と請求データ紐付けが実行される
    const deal_valid_amount = {
      deal_id: "DEAL-003",
      customer_id: "CUST-003",
      current_status: "提案中",
      amount: 100000,
      target_status: "成約",
      details: [
        {
          product_id: "PROD-003",
          product_name: "商品C",
          quantity: 2,
          unit_price: 50000,
        },
      ],
    };

    const result = updateDealStatusToContracted(deal_valid_amount);

    expect(result.deal_id).toBe("DEAL-003");
    expect(result.status).toBe("成約");
    expect(result.amount).toBe(100000);
    expect(result.invoice_generated).toBe(true);
    expect(result.invoice_id).toMatch(/^INV-/);
    expect(result.status_updated_at).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    );
  });
});