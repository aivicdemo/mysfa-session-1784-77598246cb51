import { validateAndGenerateDocuments } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  // SCEN-147
  test("明細行が1行でも不足している場合、警告が表示される", () => {
    const deal_data = {
      deal_id: "DEAL-20240115-001",
      customer_id: "CUST-00001",
      customer_name: "テスト顧客株式会社",
      customer_address: "東京都渋谷区1-1-1",
      deal_amount: 500000,
      deal_status: "成約",
      deal_date: new Date("2024-01-15T09:00:00Z"),
      invoice_expected_date: new Date("2024-02-15T23:59:59Z"),
      line_items: [
        {
          line_item_id: "LINE-001",
          product_name: "商品A",
          quantity: 10,
          unit_price: 25000,
          line_total: 250000
        },
        {
          line_item_id: "LINE-002",
          product_name: "商品B",
          quantity: 10,
          unit_price: 25000,
          line_total: 250000
        }
      ]
    };

    const deleted_line_items = [
      {
        line_item_id: "LINE-001",
        product_name: "商品A",
        quantity: 10,
        unit_price: 25000,
        line_total: 250000
      }
    ];

    const result = validateAndGenerateDocuments({
      deal_id: deal_data.deal_id,
      customer_id: deal_data.customer_id,
      customer_name: deal_data.customer_name,
      customer_address: deal_data.customer_address,
      deal_amount: deal_data.deal_amount,
      deal_status: deal_data.deal_status,
      deal_date: deal_data.deal_date,
      invoice_expected_date: deal_data.invoice_expected_date,
      line_items: deleted_line_items
    });

    expect(result).toEqual({
      success: false,
      error_type: "INSUFFICIENT_LINE_ITEMS",
      warning_message:
        "明細行が不足しています。すべての必須項目の明細行を入力してください。",
      documents_generated: false,
      estimate: null,
      order: null,
      invoice: null
    });

    expect(result.success).toBe(false);
    expect(result.documents_generated).toBe(false);
    expect(result.estimate).toBeNull();
    expect(result.order).toBeNull();
    expect(result.invoice).toBeNull();
    expect(result.warning_message).toContain("明細行が不足しています");
  });
});