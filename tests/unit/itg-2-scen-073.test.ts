import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import { generateDocumentsOnDealClose } from "../../src/logic/it-1784969823049-2-1-2";

const fetchMock = require("jest-fetch-mock");

describe("顧客向けポータル - 帳票自動生成機能", () => {
  beforeEach(() => {
    fetchMock.enableMocks();
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.disableMocks();
  });

  // SCEN-073
  test("商談ステータスが『成約』に更新され、必須情報が完全に入力されている場合、見積・注文・請求書が自動生成される", async () => {
    const deal_id = "DEAL-20240115-001";
    const customer_id = "CUST-20240115-A01";
    const customer_name = "テスト顧客企業";
    const product_name = "クラウドサービス年間ライセンス";
    const quantity = 10;
    const unit_price = 50000;
    const total_amount = 500000;
    const tax_amount = 50000;
    const gross_amount = 550000;
    const delivery_date = "2024-03-31T23:59:59Z";
    const deal_status = "成約";
    const created_at = "2024-01-15T10:00:00Z";
    const document_generated_at = "2024-01-15T10:05:00Z";

    const deal_input = {
      deal_id,
      customer_id,
      customer_name,
      product_name,
      quantity,
      unit_price,
      total_amount,
      tax_amount,
      gross_amount,
      delivery_date,
      deal_status,
      created_at,
    };

    fetchMock.mockResponseOnce(
      JSON.stringify({
        deal_id,
        customer_id,
        customer_name,
        product_name,
        quantity,
        unit_price,
        total_amount,
        tax_amount,
        gross_amount,
        delivery_date,
        deal_status,
        created_at,
      }),
      { status: 200 }
    );

    const result = await generateDocumentsOnDealClose(deal_input);

    expect(result).toBeDefined();
    expect(result.estimate_generated).toBe(true);
    expect(result.order_generated).toBe(true);
    expect(result.invoice_generated).toBe(true);

    expect(result.estimate).toBeDefined();
    expect(result.estimate.document_type).toBe("estimate");
    expect(result.estimate.customer_name).toBe(customer_name);
    expect(result.estimate.product_name).toBe(product_name);
    expect(result.estimate.quantity).toBe(quantity);
    expect(result.estimate.unit_price).toBe(unit_price);
    expect(result.estimate.total_amount).toBe(total_amount);
    expect(result.estimate.tax_amount).toBe(tax_amount);
    expect(result.estimate.gross_amount).toBe(gross_amount);
    expect(result.estimate.delivery_date).toBe(delivery_date);
    expect(result.estimate.deal_id).toBe(deal_id);

    expect(result.order).toBeDefined();
    expect(result.order.document_type).toBe("order");
    expect(result.order.customer_name).toBe(customer_name);
    expect(result.order.product_name).toBe(product_name);
    expect(result.order.quantity).toBe(quantity);
    expect(result.order.unit_price).toBe(unit_price);
    expect(result.order.total_amount).toBe(total_amount);
    expect(result.order.tax_amount).toBe(tax_amount);
    expect(result.order.gross_amount).toBe(gross_amount);
    expect(result.order.delivery_date).toBe(delivery_date);
    expect(result.order.deal_id).toBe(deal_id);

    expect(result.invoice).toBeDefined();
    expect(result.invoice.document_type).toBe("invoice");
    expect(result.invoice.customer_name).toBe(customer_name);
    expect(result.invoice.product_name).toBe(product_name);
    expect(result.invoice.quantity).toBe(quantity);
    expect(result.invoice.unit_price).toBe(unit_price);
    expect(result.invoice.total_amount).toBe(total_amount);
    expect(result.invoice.tax_amount).toBe(tax_amount);
    expect(result.invoice.gross_amount).toBe(gross_amount);
    expect(result.invoice.delivery_date).toBe(delivery_date);
    expect(result.invoice.deal_id).toBe(deal_id);

    expect(result.documents_count).toBe(3);
    expect(result.generation_timestamp).toBeDefined();
    expect(typeof result.generation_timestamp).toBe("string");

    expect(result.estimate.line_items).toBeDefined();
    expect(Array.isArray(result.estimate.line_items)).toBe(true);
    expect(result.estimate.line_items.length).toBeGreaterThan(0);
    expect(result.estimate.line_items[0]).toMatchObject({
      product_name: product_name,
      quantity: quantity,
      unit_price: unit_price,
    });

    expect(result.order.line_items).toBeDefined();
    expect(Array.isArray(result.order.line_items)).toBe(true);
    expect(result.order.line_items.length).toBeGreaterThan(0);

    expect(result.invoice.line_items).toBeDefined();
    expect(Array.isArray(result.invoice.line_items)).toBe(true);
    expect(result.invoice.line_items.length).toBeGreaterThan(0);

    expect(result.validation_status).toBe("success");
    expect(result.all_required_fields_present).toBe(true);
  });
});