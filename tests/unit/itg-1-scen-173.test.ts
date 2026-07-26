import { reconcileDealsAndInvoices } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-173
  test("請求予定日のデータが存在しない場合でもエラーなく処理が継続される", () => {
    const deals = [
      {
        deal_id: "DEAL-001",
        customer_name: "顧客A",
        status: "受注",
        amount: 100000,
        invoice_date: "2024-01-15",
        invoice_amount: 100000,
        planned_invoice_date: "2024-01-10",
      },
      {
        deal_id: "DEAL-002",
        customer_name: "顧客B",
        status: "受注",
        amount: 50000,
        invoice_date: "2024-01-20",
        invoice_amount: 50000,
        planned_invoice_date: null,
      },
      {
        deal_id: "DEAL-003",
        customer_name: "顧客C",
        status: "完了",
        amount: 150000,
        invoice_date: "2024-01-25",
        invoice_amount: 150000,
        planned_invoice_date: undefined,
      },
    ];

    const result = reconcileDealsAndInvoices(deals);

    expect(result).toEqual({
      total_deals_processed: 3,
      matched_deals: 1,
      unmatched_deals: 0,
      skipped_deals: 2,
      errors: [],
      reconciliation_report: [
        {
          deal_id: "DEAL-001",
          customer_name: "顧客A",
          status: "受注",
          amount: 100000,
          invoice_date: "2024-01-15",
          invoice_amount: 100000,
          planned_invoice_date: "2024-01-10",
          variance_days: 5,
          is_delayed: false,
          reconciliation_status: "一致",
        },
      ],
      skipped_records: [
        {
          deal_id: "DEAL-002",
          reason: "請求予定日が存在しない",
        },
        {
          deal_id: "DEAL-003",
          reason: "請求予定日が存在しない",
        },
      ],
    });

    expect(result.errors.length).toBe(0);
    expect(result.total_deals_processed).toBe(3);
    expect(result.skipped_deals).toBe(2);
  });
});