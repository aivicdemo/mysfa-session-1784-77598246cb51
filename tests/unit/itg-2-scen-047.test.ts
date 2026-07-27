import { validateAndApproveInvoice } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向け専用ポータルでの商談情報参照機能", () => {
  // SCEN-047
  test("請求書検証・承認機能 - 請求書の金額・顧客情報・明細が正確であることを検証し、承認が完了する", () => {
    const invoice_id = "INV-20240115-001";
    const customer_id = "CUST-12345";
    const customer_name = "株式会社テスト";
    const customer_address = "東京都渋谷区1-1-1";
    const customer_phone = "03-XXXX-XXXX";
    const customer_email = "contact@test-company.jp";

    const line_item_1 = {
      product_id: "PROD-001",
      product_name: "プロダクトA",
      quantity: 10,
      unit_price: 5000,
      line_amount: 50000,
    };

    const line_item_2 = {
      product_id: "PROD-002",
      product_name: "プロダクトB",
      quantity: 5,
      unit_price: 3000,
      line_amount: 15000,
    };

    const subtotal = 65000;
    const tax_rate = 0.1;
    const tax_amount = 6500;
    const total_amount = 71500;

    const approval_datetime = new Date("2024-01-15T14:30:00Z");

    const invoice_data = {
      invoice_id: invoice_id,
      customer_id: customer_id,
      customer_name: customer_name,
      customer_address: customer_address,
      customer_phone: customer_phone,
      customer_email: customer_email,
      line_items: [line_item_1, line_item_2],
      subtotal: subtotal,
      tax_rate: tax_rate,
      tax_amount: tax_amount,
      total_amount: total_amount,
      approval_status: "pending",
      approval_datetime: null,
    };

    const result = validateAndApproveInvoice(invoice_data);

    expect(result).toEqual({
      invoice_id: invoice_id,
      customer_id: customer_id,
      customer_name: customer_name,
      customer_address: customer_address,
      customer_phone: customer_phone,
      customer_email: customer_email,
      line_items: [
        {
          product_id: "PROD-001",
          product_name: "プロダクトA",
          quantity: 10,
          unit_price: 5000,
          line_amount: 50000,
        },
        {
          product_id: "PROD-002",
          product_name: "プロダクトB",
          quantity: 5,
          unit_price: 3000,
          line_amount: 15000,
        },
      ],
      subtotal: 65000,
      tax_rate: 0.1,
      tax_amount: 6500,
      total_amount: 71500,
      approval_status: "approved",
      approval_datetime: approval_datetime,
    });

    expect(result.approval_status).toBe("approved");
    expect(result.total_amount).toBe(71500);
    expect(result.customer_name).toBe("株式会社テスト");
    expect(result.line_items).toHaveLength(2);
    expect(result.line_items[0].line_amount).toBe(50000);
    expect(result.line_items[1].line_amount).toBe(15000);
  });
});