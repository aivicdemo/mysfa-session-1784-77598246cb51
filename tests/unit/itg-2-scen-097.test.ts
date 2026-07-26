import { validateAndApproveInvoice } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル - 請求書検証・承認機能", () => {
  // SCEN-097
  test("請求書の金額・顧客情報・明細が全て正確な場合、承認フローが正常に完了する", () => {
    const invoice_input = {
      invoice_id: "INV-2024-001",
      amount_total: 150000,
      currency: "JPY",
      customer_info: {
        customer_id: "CUST-12345",
        customer_name: "株式会社テスト",
        customer_address: "東京都渋谷区1-1-1",
      },
      line_items: [
        {
          item_id: "ITEM-001",
          item_name: "商品A",
          quantity: 10,
          unit_price: 10000,
          line_amount: 100000,
        },
        {
          item_id: "ITEM-002",
          item_name: "商品B",
          quantity: 5,
          unit_price: 10000,
          line_amount: 50000,
        },
      ],
      issue_date: "2024-01-15",
      due_date: "2024-02-15",
      tax_rate: 0.1,
      tax_amount: 15000,
    };

    const result = validateAndApproveInvoice(invoice_input);

    expect(result.validation_status).toBe("OK");
    expect(result.amount_recognized).toBe(150000);
    expect(result.customer_info_valid).toBe(true);
    expect(result.line_items_valid).toBe(true);
    expect(result.line_items_count).toBe(2);
    expect(result.approval_status).toBe("approved");
    expect(result.approval_completed).toBe(true);
    expect(result.message).toBe("請求書の検証・承認が正常に完了しました");
  });
});