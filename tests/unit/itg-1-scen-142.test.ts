import { updateDealStatusToContract } from "../../src/logic/it-1784969823049-2-1-1";

describe("商談レコードの進捗ステータスと提案内容の入力・保存機能", () => {
  // SCEN-142: [error] 商談ステータス更新時の必須項目チェックと請求データ紐付け - 商談ステータスを『成約』に更新する際、金額が0円または未入力の場合、ステータス更新が拒否される
  test("金額が0円の場合、ステータス更新がバリデーションエラーにより拒否される", () => {
    const deal_record = {
      deal_id: "DEAL-001",
      customer_id: "CUST-001",
      customer_name: "テスト顧客",
      current_status: "提案中",
      target_status: "成約",
      amount: 0,
      description: "提案内容"
    };

    expect(() => updateDealStatusToContract(deal_record)).toThrow(/金額/);
  });

  test("金額が未入力の場合、ステータス更新がバリデーションエラーにより拒否される", () => {
    const deal_record = {
      deal_id: "DEAL-002",
      customer_id: "CUST-002",
      customer_name: "テスト顧客2",
      current_status: "提案中",
      target_status: "成約",
      amount: undefined,
      description: "提案内容"
    };

    expect(() => updateDealStatusToContract(deal_record)).toThrow(/金額/);
  });

  test("必須項目がすべて入力されている場合、ステータス更新が成功する", () => {
    const deal_record = {
      deal_id: "DEAL-003",
      customer_id: "CUST-003",
      customer_name: "テスト顧客3",
      current_status: "提案中",
      target_status: "成約",
      amount: 100000,
      description: "提案内容",
      customer_info: "顧客情報完全",
      line_items: [
        {
          item_id: "ITEM-001",
          item_name: "商品A",
          quantity: 1,
          unit_price: 100000
        }
      ]
    };

    const result = updateDealStatusToContract(deal_record);

    expect(result.success).toBe(true);
    expect(result.updated_status).toBe("成約");
    expect(result.deal_id).toBe("DEAL-003");
    expect(result.invoice_data).toBeDefined();
    expect(result.invoice_data.deal_id).toBe("DEAL-003");
    expect(result.invoice_data.customer_id).toBe("CUST-003");
    expect(result.invoice_data.amount).toBe(100000);
  });

  test("金額が負数の場合、ステータス更新がバリデーションエラーにより拒否される", () => {
    const deal_record = {
      deal_id: "DEAL-004",
      customer_id: "CUST-004",
      customer_name: "テスト顧客4",
      current_status: "提案中",
      target_status: "成約",
      amount: -50000,
      description: "提案内容"
    };

    expect(() => updateDealStatusToContract(deal_record)).toThrow(/金額/);
  });

  test("金額が正の値で顧客情報が完全な場合、請求データが自動紐付けされる", () => {
    const deal_record = {
      deal_id: "DEAL-005",
      customer_id: "CUST-005",
      customer_name: "テスト顧客5",
      current_status: "交渉中",
      target_status: "成約",
      amount: 250000,
      description: "提案内容",
      customer_info: "顧客情報完全",
      line_items: [
        {
          item_id: "ITEM-001",
          item_name: "商品A",
          quantity: 2,
          unit_price: 100000
        },
        {
          item_id: "ITEM-002",
          item_name: "商品B",
          quantity: 1,
          unit_price: 50000
        }
      ]
    };

    const result = updateDealStatusToContract(deal_record);

    expect(result.success).toBe(true);
    expect(result.updated_status).toBe("成約");
    expect(result.invoice_data).toBeDefined();
    expect(result.invoice_data.amount).toBe(250000);
    expect(result.invoice_data.line_items_count).toBe(2);
  });

  test("金額が入力されていない（null）場合、ステータス更新がバリデーションエラーにより拒否される", () => {
    const deal_record = {
      deal_id: "DEAL-006",
      customer_id: "CUST-006",
      customer_name: "テスト顧客6",
      current_status: "提案中",
      target_status: "成約",
      amount: null,
      description: "提案内容"
    };

    expect(() => updateDealStatusToContract(deal_record)).toThrow(/金額/);
  });
});