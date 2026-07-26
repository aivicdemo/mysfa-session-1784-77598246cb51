import { validateInvoiceApproval } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-215
  test("請求明細が1行のみの請求書が妥当性を満たしていると判定される", () => {
    const invoice_input = {
      customer_id: "CUST-001",
      customer_name: "テスト顧客株式会社",
      invoice_date: "2024-01-15",
      invoice_amount: 100000,
      invoice_details: [
        {
          line_id: 1,
          product_name: "商品A",
          quantity: 10,
          unit_price: 10000,
          line_amount: 100000,
        },
      ],
      tax_rate: 0.1,
      total_with_tax: 110000,
    };

    const validation_result = validateInvoiceApproval(invoice_input);

    expect(validation_result.is_valid).toBe(true);
    expect(validation_result.validation_errors).toEqual([]);
    expect(validation_result.approval_status).toBe("approved");
    expect(validation_result.invoice_line_count).toBe(1);
    expect(validation_result.calculated_amount).toBe(100000);
    expect(validation_result.calculated_total_with_tax).toBe(110000);
  });
});