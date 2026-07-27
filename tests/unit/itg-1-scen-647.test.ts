import { verifyRevenueAndInvoiceReconciliation } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-647
  test("売上実績と請求書の金額が完全一致するとき、金額ズレなしと判定される", () => {
    const revenue_record = {
      revenue_id: "REV001",
      customer_id: "CUST001",
      product_id: "PROD001",
      revenue_amount: 100000,
      revenue_date: "2024-01-15",
      mismatch_flag: true,
    };

    const invoice_record = {
      invoice_id: "INV001",
      customer_id: "CUST001",
      invoice_amount: 100000,
      invoice_date: "2024-01-15",
    };

    const current_timestamp = "2024-01-15T09:30:00Z";

    const reconciliation_log = {
      reconciliation_date: current_timestamp,
      revenue_id: "REV001",
      invoice_id: "INV001",
      judgment_result: "一致",
      amount_difference: 0,
    };

    const result = verifyRevenueAndInvoiceReconciliation(
      revenue_record,
      invoice_record,
      current_timestamp
    );

    expect(result.mismatch_flag_updated).toBe(false);
    expect(result.judgment_result).toBe("一致");
    expect(result.amount_difference).toBe(0);
    expect(result.reconciliation_log.reconciliation_date).toBe(current_timestamp);
    expect(result.reconciliation_log.revenue_id).toBe("REV001");
    expect(result.reconciliation_log.invoice_id).toBe("INV001");
    expect(result.reconciliation_log.judgment_result).toBe("一致");
    expect(result.reconciliation_log.amount_difference).toBe(0);
  });
});