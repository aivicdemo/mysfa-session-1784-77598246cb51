import { detectDealStatusAndInvoiceDiscrepancies } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-136
  test("請求書が発行されていない受注商談が『ズレあり』として正確に検出される", () => {
    const test_deals = [
      {
        deal_id: "DEAL-001",
        deal_name: "顧客A 年間契約",
        status: "受注",
        amount: 1200000,
        invoice_issued_date: null,
        invoice_amount: null,
        expected_invoice_date: "2024-04-15",
      },
      {
        deal_id: "DEAL-002",
        deal_name: "顧客B プロジェクト",
        status: "受注",
        amount: 800000,
        invoice_issued_date: "2024-04-10",
        invoice_amount: 800000,
        expected_invoice_date: "2024-04-15",
      },
      {
        deal_id: "DEAL-003",
        deal_name: "顧客C 小規模案件",
        status: "失注",
        amount: 300000,
        invoice_issued_date: null,
        invoice_amount: null,
        expected_invoice_date: "2024-04-20",
      },
    ];

    const current_date = new Date("2024-04-20T09:00:00Z");

    const result = detectDealStatusAndInvoiceDiscrepancies(
      test_deals,
      current_date
    );

    expect(result).toEqual({
      total_deals_checked: 3,
      discrepancies_found: 1,
      discrepancy_details: [
        {
          deal_id: "DEAL-001",
          deal_name: "顧客A 年間契約",
          status: "受注",
          amount: 1200000,
          discrepancy_type: "請求書未発行",
          invoice_issued_date: null,
          invoice_amount: null,
          expected_invoice_date: "2024-04-15",
          days_overdue: 5,
          severity: "high",
        },
      ],
      execution_timestamp: "2024-04-20T09:00:00Z",
    });
  });
});