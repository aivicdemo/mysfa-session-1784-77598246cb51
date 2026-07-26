import { validateMigrationDataConsistency } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-228
  test("移行データ一貫性検証機能 - 売上実績と請求書の金額が完全に一致する場合、移行完了判定が成功と判定される", () => {
    const sales_record = {
      sales_id: "SR-001",
      customer_id: "CUST-12345",
      amount: 1000000,
      recorded_date: "2024-05-01T10:30:00Z",
      status: "completed",
    };

    const invoice_record = {
      invoice_id: "INV-001",
      customer_id: "CUST-12345",
      amount: 1000000,
      issued_date: "2024-05-01T10:35:00Z",
      status: "issued",
    };

    const result = validateMigrationDataConsistency({
      sales_records: [sales_record],
      invoice_records: [invoice_record],
      check_date: "2024-05-15T00:00:00Z",
    });

    expect(result.is_consistent).toBe(true);
    expect(result.migration_completion_status).toBe("success");
    expect(result.validation_log).toContain("一貫性チェック: OK");
    expect(result.total_sales_amount).toBe(1000000);
    expect(result.total_invoice_amount).toBe(1000000);
    expect(result.amount_discrepancy).toBe(0);
    expect(result.inconsistencies).toHaveLength(0);
  });
});