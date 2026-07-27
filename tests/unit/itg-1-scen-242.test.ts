import { validateInvoiceContent } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成 - 帳票内容検証", () => {
  // SCEN-242
  test("帳票内容検証機能 - 顧客情報の企業名が空の場合、警告を表示する", () => {
    const customer = {
      customer_id: "CUST001",
      company_name: "",
      contact_person: "山田太郎",
      email: "yamada@example.com",
      phone: "03-1234-5678",
    };

    const invoice = {
      invoice_id: "INV20240115001",
      customer_id: "CUST001",
      amount: 100000,
      invoice_date: "2024-01-15",
      due_date: "2024-02-15",
      line_items: [
        {
          item_id: "ITEM001",
          product_name: "コンサルティングサービス",
          quantity: 1,
          unit_price: 100000,
          subtotal: 100000,
        },
      ],
    };

    const validationResult = validateInvoiceContent({
      customer: customer,
      invoice: invoice,
    });

    expect(validationResult.is_valid).toBe(false);
    expect(validationResult.warning_message).toBe("企業名を入力してください");
    expect(validationResult.form_button_disabled).toBe(true);
    expect(validationResult.validation_logs).toContainEqual({
      log_level: "error",
      error_code: "validation_error",
      field_name: "customer_company_name_empty",
    });
  });
});