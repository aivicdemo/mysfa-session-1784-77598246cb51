import { reconcileSalesAndInvoices } from "../../src/logic/it-1784969823049-1-1-1";

describe("売上実績・請求状況照合機能", () => {
  // SCEN-973
  test("照合対象期間が月末（例：2月28日）を跨ぐ場合、期間に含まれるすべてのデータが照合される", () => {
    // 照合対象期間: 2月1日～2月28日
    const reconciliation_period_start = new Date("2024-02-01T00:00:00Z");
    const reconciliation_period_end = new Date("2024-02-28T23:59:59Z");

    // 売上実績データ: 2月1日、2月15日、2月28日
    const sales_data = [
      {
        id: "sales_001",
        sale_date: new Date("2024-02-01T10:00:00Z"),
        sale_amount: 10000,
        deal_id: "deal_001",
      },
      {
        id: "sales_002",
        sale_date: new Date("2024-02-15T14:30:00Z"),
        sale_amount: 20000,
        deal_id: "deal_002",
      },
      {
        id: "sales_003",
        sale_date: new Date("2024-02-28T16:45:00Z"),
        sale_amount: 15000,
        deal_id: "deal_003",
      },
    ];

    // 請求データ: 2月1日、2月15日、2月28日
    const invoice_data = [
      {
        id: "invoice_001",
        invoice_date: new Date("2024-02-01T10:00:00Z"),
        invoice_amount: 10000,
        deal_id: "deal_001",
      },
      {
        id: "invoice_002",
        invoice_date: new Date("2024-02-15T14:30:00Z"),
        invoice_amount: 20000,
        deal_id: "deal_002",
      },
      {
        id: "invoice_003",
        invoice_date: new Date("2024-02-28T16:45:00Z"),
        invoice_amount: 15000,
        deal_id: "deal_003",
      },
    ];

    // 売上実績・請求状況照合機能を実行
    const reconciliation_result = reconcileSalesAndInvoices(
      sales_data,
      invoice_data,
      reconciliation_period_start,
      reconciliation_period_end
    );

    // 照合対象期間に含まれるデータ件数: 3件
    expect(reconciliation_result.reconciled_records_count).toBe(3);

    // 売上実績の合計: 10,000 + 20,000 + 15,000 = 45,000円
    expect(reconciliation_result.total_sales_amount).toBe(45000);

    // 請求額の合計: 10,000 + 20,000 + 15,000 = 45,000円
    expect(reconciliation_result.total_invoice_amount).toBe(45000);

    // 売上実績と請求額が完全に一致
    expect(reconciliation_result.total_sales_amount).toBe(
      reconciliation_result.total_invoice_amount
    );

    // 各データ行について、売上実績の金額と請求額が一致していることを検証
    expect(reconciliation_result.matched_records).toHaveLength(3);
    expect(reconciliation_result.matched_records[0]).toEqual({
      deal_id: "deal_001",
      sales_amount: 10000,
      invoice_amount: 10000,
      match_status: "matched",
    });
    expect(reconciliation_result.matched_records[1]).toEqual({
      deal_id: "deal_002",
      sales_amount: 20000,
      invoice_amount: 20000,
      match_status: "matched",
    });
    expect(reconciliation_result.matched_records[2]).toEqual({
      deal_id: "deal_003",
      sales_amount: 15000,
      invoice_amount: 15000,
      match_status: "matched",
    });

    // 照合レポートの日付範囲が「2月1日～2月28日」で表示される
    expect(reconciliation_result.report_period_start).toEqual(
      new Date("2024-02-01T00:00:00Z")
    );
    expect(reconciliation_result.report_period_end).toEqual(
      new Date("2024-02-28T23:59:59Z")
    );

    // 月末を跨ぐ期間のデータが過不足なく処理されたことを確認
    expect(reconciliation_result.period_includes_month_end).toBe(true);
    expect(reconciliation_result.unmatched_records_count).toBe(0);
    expect(reconciliation_result.reconciliation_status).toBe("completed");
  });
});