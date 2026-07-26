import { generateQuotationOrderInvoice } from "../../src/logic/it-1784969823049-2-1-1";

describe("商談レコードの進捗ステータスと提案内容の入力・保存機能", () => {
  test("SCEN-162: 見積・注文・請求書統一フォーマット自動生成機能 - 見積・注文・請求書の3点セットがすべて生成される", () => {
    const deal_id = "DEAL-20240415-001";
    const customer_id = "CUST-12345";
    const customer_name = "ABC株式会社";
    const customer_address = "東京都渋谷区1-1-1";
    const product_name = "営業管理システムライセンス";
    const product_quantity = 10;
    const product_unit_price = 50000;
    const sales_tax_rate = 0.1;

    const subtotal = product_quantity * product_unit_price;
    const sales_tax = Math.floor(subtotal * sales_tax_rate);
    const total_amount = subtotal + sales_tax;

    const quotation_id = "QT-20240415-001";
    const order_id = "OR-20240415-001";
    const invoice_id = "INV-20240415-001";

    const generation_date = new Date("2024-04-15T10:30:00Z");
    const quotation_expiry_date = new Date("2024-05-15T23:59:59Z");
    const delivery_completion_date = new Date("2024-04-20T17:00:00Z");
    const invoice_issue_date = new Date("2024-04-25T09:00:00Z");

    const input_data = {
      deal_id,
      customer_id,
      customer_name,
      customer_address,
      product_name,
      product_quantity,
      product_unit_price,
      sales_tax_rate,
      status: "成約",
      generated_at: generation_date,
    };

    const result = generateQuotationOrderInvoice(input_data);

    expect(result).toBeDefined();
    expect(result).not.toBeNull();

    expect(result.quotation).toBeDefined();
    expect(result.quotation.document_id).toBe(quotation_id);
    expect(result.quotation.document_type).toBe("見積書");
    expect(result.quotation.customer_id).toBe(customer_id);
    expect(result.quotation.customer_name).toBe(customer_name);
    expect(result.quotation.customer_address).toBe(customer_address);
    expect(result.quotation.product_name).toBe(product_name);
    expect(result.quotation.product_quantity).toBe(product_quantity);
    expect(result.quotation.product_unit_price).toBe(product_unit_price);
    expect(result.quotation.subtotal_amount).toBe(subtotal);
    expect(result.quotation.sales_tax).toBe(sales_tax);
    expect(result.quotation.total_amount).toBe(total_amount);
    expect(result.quotation.issue_date).toEqual(generation_date);
    expect(result.quotation.expiry_date).toEqual(quotation_expiry_date);
    expect(result.quotation.format_version).toBe("1.0");

    expect(result.order).toBeDefined();
    expect(result.order.document_id).toBe(order_id);
    expect(result.order.document_type).toBe("注文書");
    expect(result.order.customer_id).toBe(customer_id);
    expect(result.order.customer_name).toBe(customer_name);
    expect(result.order.customer_address).toBe(customer_address);
    expect(result.order.product_name).toBe(product_name);
    expect(result.order.product_quantity).toBe(product_quantity);
    expect(result.order.product_unit_price).toBe(product_unit_price);
    expect(result.order.subtotal_amount).toBe(subtotal);
    expect(result.order.sales_tax).toBe(sales_tax);
    expect(result.order.total_amount).toBe(total_amount);
    expect(result.order.issue_date).toEqual(generation_date);
    expect(result.order.format_version).toBe("1.0");
    expect(result.order.quotation_reference_id).toBe(quotation_id);

    expect(result.invoice).toBeDefined();
    expect(result.invoice.document_id).toBe(invoice_id);
    expect(result.invoice.document_type).toBe("請求書");
    expect(result.invoice.customer_id).toBe(customer_id);
    expect(result.invoice.customer_name).toBe(customer_name);
    expect(result.invoice.customer_address).toBe(customer_address);
    expect(result.invoice.product_name).toBe(product_name);
    expect(result.invoice.product_quantity).toBe(product_quantity);
    expect(result.invoice.product_unit_price).toBe(product_unit_price);
    expect(result.invoice.subtotal_amount).toBe(subtotal);
    expect(result.invoice.sales_tax).toBe(sales_tax);
    expect(result.invoice.total_amount).toBe(total_amount);
    expect(result.invoice.issue_date).toEqual(invoice_issue_date);
    expect(result.invoice.format_version).toBe("1.0");
    expect(result.invoice.order_reference_id).toBe(order_id);
    expect(result.invoice.delivery_completion_date).toEqual(delivery_completion_date);

    expect(result.document_set_validation).toBeDefined();
    expect(result.document_set_validation.all_documents_generated).toBe(true);
    expect(result.document_set_validation.quotation_id).toBe(quotation_id);
    expect(result.document_set_validation.order_id).toBe(order_id);
    expect(result.document_set_validation.invoice_id).toBe(invoice_id);
    expect(result.document_set_validation.format_consistency).toBe(true);
    expect(result.document_set_validation.data_integrity_verified).toBe(true);
    expect(result.document_set_validation.deal_id_linked).toBe(deal_id);
    expect(result.document_set_validation.set_completeness_status).toBe("完全");

    expect(result.generation_status).toBe("成功");
    expect(result.timestamp).toEqual(generation_date);
  });
});