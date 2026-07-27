import { validateInvoiceApproval } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向け専用ポータルでの商談情報参照機能", () => {
  // SCEN-109
  test("[normal] 請求書承認検証機能 - 複数の請求書明細の合計が請求書合計金額と一致するとき、全体検証を成功させる", () => {
    const invoice_id = "INV-2024-001";
    const customer_id = "CUST-001";
    const invoice_total_amount = 100000;

    const invoice_lines = [
      {
        line_id: "LINE-001",
        product_name: "商品A",
        quantity: 10,
        unit_price: 5000,
        line_subtotal: 50000,
      },
      {
        line_id: "LINE-002",
        product_name: "商品B",
        quantity: 10,
        unit_price: 5000,
        line_subtotal: 50000,
      },
    ];

    const invoice_data = {
      invoice_id: invoice_id,
      customer_id: customer_id,
      total_amount: invoice_total_amount,
      invoice_lines: invoice_lines,
    };

    const result = validateInvoiceApproval(invoice_data);

    expect(result.is_valid).toBe(true);
    expect(result.approval_status).toBe("承認可能");
    expect(result.error_message).toBe("");
    expect(result.calculated_line_total).toBe(100000);
  });
});