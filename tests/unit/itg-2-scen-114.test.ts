import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import { reflectInvoiceToCustomerPortal } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向け専用ポータルでの商談情報参照機能", () => {
  // SCEN-114
  test("請求書承認から顧客ポータル反映までが営業日ベースで1日以内に完了する", () => {
    const approval_timestamp = new Date("2024-01-15T14:30:00Z");
    const business_day_offset = 1;
    const expected_reflection_deadline = new Date("2024-01-16T17:00:00Z");

    const invoice_data = {
      invoice_id: "INV-2024-001",
      customer_id: "CUST-12345",
      invoice_amount: 150000,
      invoice_date: "2024-01-15",
      due_date: "2024-02-14",
      line_items: [
        {
          item_id: "ITEM-001",
          description: "Product A",
          quantity: 2,
          unit_price: 50000,
          line_amount: 100000,
        },
        {
          item_id: "ITEM-002",
          description: "Service B",
          quantity: 1,
          unit_price: 50000,
          line_amount: 50000,
        },
      ],
      tax_amount: 0,
      total_amount: 150000,
      status: "draft",
    };

    const approval_result = {
      invoice_id: invoice_data.invoice_id,
      approved_at: approval_timestamp.toISOString(),
      approved_by: "approver_user_001",
      status: "approved",
      reflection_status: "pending",
    };

    const portal_reflection = reflectInvoiceToCustomerPortal({
      invoice_id: invoice_data.invoice_id,
      customer_id: invoice_data.customer_id,
      approval_timestamp: approval_timestamp.toISOString(),
      invoice_amount: invoice_data.invoice_amount,
      invoice_date: invoice_data.invoice_date,
      due_date: invoice_data.due_date,
      line_items: invoice_data.line_items,
      tax_amount: invoice_data.tax_amount,
      total_amount: invoice_data.total_amount,
      status: approval_result.status,
    });

    expect(portal_reflection.invoice_id).toBe("INV-2024-001");
    expect(portal_reflection.customer_id).toBe("CUST-12345");
    expect(portal_reflection.status).toBe("reflected");
    expect(portal_reflection.reflected_at).toBeDefined();

    const reflected_timestamp = new Date(portal_reflection.reflected_at);
    const approval_datetime = new Date(approval_result.approved_at);
    const time_diff_ms = reflected_timestamp.getTime() - approval_datetime.getTime();
    const time_diff_hours = time_diff_ms / (1000 * 60 * 60);

    const is_within_business_day = time_diff_hours <= 24;
    expect(is_within_business_day).toBe(true);

    expect(portal_reflection.invoice_amount).toBe(150000);
    expect(portal_reflection.total_amount).toBe(150000);
    expect(portal_reflection.tax_amount).toBe(0);
    expect(portal_reflection.invoice_date).toBe("2024-01-15");
    expect(portal_reflection.due_date).toBe("2024-02-14");

    expect(portal_reflection.line_items).toHaveLength(2);
    expect(portal_reflection.line_items[0].item_id).toBe("ITEM-001");
    expect(portal_reflection.line_items[0].description).toBe("Product A");
    expect(portal_reflection.line_items[0].quantity).toBe(2);
    expect(portal_reflection.line_items[0].unit_price).toBe(50000);
    expect(portal_reflection.line_items[0].line_amount).toBe(100000);

    expect(portal_reflection.line_items[1].item_id).toBe("ITEM-002");
    expect(portal_reflection.line_items[1].description).toBe("Service B");
    expect(portal_reflection.line_items[1].quantity).toBe(1);
    expect(portal_reflection.line_items[1].unit_price).toBe(50000);
    expect(portal_reflection.line_items[1].line_amount).toBe(50000);

    expect(portal_reflection.reflection_timer_started).toBe(true);
    expect(portal_reflection.portal_accessible).toBe(true);
  });
});