import { validateInvoiceTaxAmount } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-218
  test("顧客請求内容照合検証 - 税額計算が誤っている場合に営業への通知が生成される", () => {
    const invoice_data = {
      invoice_id: "INV-20240115-001",
      customer_id: "CUST-12345",
      customer_name: "テスト株式会社",
      base_amount: 100000,
      calculated_tax_amount: 12000,
      correct_tax_rate: 0.1,
    };

    const correct_tax_amount = Math.round(
      invoice_data.base_amount * invoice_data.correct_tax_rate
    );

    const result = validateInvoiceTaxAmount(invoice_data);

    expect(result.has_error).toBe(true);

    expect(result.error_type).toBe("tax_calculation_mismatch");

    expect(result.notification).toBeDefined();
    expect(result.notification.recipient_type).toBe("sales_staff");
    expect(result.notification.invoice_id).toBe("INV-20240115-001");
    expect(result.notification.customer_id).toBe("CUST-12345");
    expect(result.notification.customer_name).toBe("テスト株式会社");
    expect(result.notification.calculated_tax_amount).toBe(12000);
    expect(result.notification.correct_tax_amount).toBe(correct_tax_amount);
    expect(result.notification.tax_discrepancy).toBe(
      invoice_data.calculated_tax_amount - correct_tax_amount
    );
    expect(result.notification.message).toContain("税額");
    expect(result.notification.message).toContain("INV-20240115-001");
    expect(result.notification.message).toContain("テスト株式会社");

    expect(result.notification.severity).toBe("high");
    expect(result.notification.action_required).toBe(true);

    expect(result.is_valid).toBe(false);
  });
});