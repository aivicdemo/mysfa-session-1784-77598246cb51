import { describe, it, expect, beforeEach } from "@jest/globals";
import { validateInvoiceForApproval } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SCEN-212: [normal] 請求書承認検証 - 金額・顧客情報・明細が全て一致した請求書が承認可能と判定される", () => {
    // Arrange: テスト用の請求書データを準備
    const invoice_data = {
      invoice_id: "INV-20240415-001",
      customer_id: "CUST-TEST-001",
      customer_name: "テスト太郎",
      invoice_amount: 100000,
      invoice_date: "2024-04-15",
      line_items: [
        {
          line_item_id: "LINE-001",
          product_name: "商品A",
          quantity: 10,
          unit_price: 10000,
          line_amount: 100000,
        },
      ],
      tax_amount: 0,
      total_amount: 100000,
    };

    const expected_validation_result = {
      approval_status: "承認可能",
      is_valid: true,
      validation_details: {
        amount_match: true,
        customer_info_match: true,
        line_items_match: true,
        required_fields_complete: true,
        errors: [],
      },
    };

    // Act: 請求書の承認検証処理を実行
    const validation_result = validateInvoiceForApproval(invoice_data);

    // Assert: 検証結果が期待値と一致することを確認
    expect(validation_result.approval_status).toBe("承認可能");
    expect(validation_result.is_valid).toBe(true);
    expect(validation_result.validation_details.amount_match).toBe(true);
    expect(validation_result.validation_details.customer_info_match).toBe(true);
    expect(validation_result.validation_details.line_items_match).toBe(true);
    expect(validation_result.validation_details.required_fields_complete).toBe(
      true
    );
    expect(validation_result.validation_details.errors.length).toBe(0);
    expect(validation_result).toEqual(expected_validation_result);
  });
});