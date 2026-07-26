import { detectDealStatusAndInvoiceDiscrepancies } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-170: [normal] 商談ステータスと請求書発行状況の自動照合・ズレ検出機能 - 『受注』ステータスの商談と請求書発行日を照合し、売上計上予定日とのズレを検出する
  test("『受注』ステータスの商談と請求書発行日のズレが正確に検出され、日数差分が正しく計算・表示される", () => {
    const deal_id_1 = "DEAL-001";
    const deal_status_1 = "受注";
    const revenue_recognition_date_1 = new Date("2024-04-15T00:00:00Z");
    const invoice_issue_date_1 = new Date("2024-04-18T00:00:00Z");
    const days_discrepancy_1 = 3;

    const deal_id_2 = "DEAL-002";
    const deal_status_2 = "受注";
    const revenue_recognition_date_2 = new Date("2024-04-20T00:00:00Z");
    const invoice_issue_date_2 = new Date("2024-04-20T00:00:00Z");
    const days_discrepancy_2 = 0;

    const deal_id_3 = "DEAL-003";
    const deal_status_3 = "受注";
    const revenue_recognition_date_3 = new Date("2024-04-25T00:00:00Z");
    const invoice_issue_date_3 = new Date("2024-05-02T00:00:00Z");
    const days_discrepancy_3 = 7;
    const tolerance_threshold_days = 5;

    const deals_and_invoices = [
      {
        deal_id: deal_id_1,
        deal_status: deal_status_1,
        revenue_recognition_date: revenue_recognition_date_1,
        invoice_issue_date: invoice_issue_date_1,
        customer_name: "顧客A",
        amount: 500000,
      },
      {
        deal_id: deal_id_2,
        deal_status: deal_status_2,
        revenue_recognition_date: revenue_recognition_date_2,
        invoice_issue_date: invoice_issue_date_2,
        customer_name: "顧客B",
        amount: 300000,
      },
      {
        deal_id: deal_id_3,
        deal_status: deal_status_3,
        revenue_recognition_date: revenue_recognition_date_3,
        invoice_issue_date: invoice_issue_date_3,
        customer_name: "顧客C",
        amount: 800000,
      },
    ];

    const result = detectDealStatusAndInvoiceDiscrepancies(
      deals_and_invoices,
      tolerance_threshold_days
    );

    expect(result).toBeDefined();
    expect(Array.isArray(result.discrepancies)).toBe(true);
    expect(result.discrepancies.length).toBe(2);

    const discrepancy_1 = result.discrepancies.find(
      (d: { deal_id: string }) => d.deal_id === deal_id_1
    );
    expect(discrepancy_1).toBeDefined();
    expect(discrepancy_1.deal_id).toBe(deal_id_1);
    expect(discrepancy_1.deal_status).toBe(deal_status_1);
    expect(discrepancy_1.revenue_recognition_date).toEqual(
      revenue_recognition_date_1
    );
    expect(discrepancy_1.invoice_issue_date).toEqual(invoice_issue_date_1);
    expect(discrepancy_1.days_discrepancy).toBe(days_discrepancy_1);
    expect(discrepancy_1.customer_name).toBe("顧客A");
    expect(discrepancy_1.amount).toBe(500000);
    expect(discrepancy_1.is_within_tolerance).toBe(false);
    expect(discrepancy_1.alert_level).toBe("warning");

    const discrepancy_3 = result.discrepancies.find(
      (d: { deal_id: string }) => d.deal_id === deal_id_3
    );
    expect(discrepancy_3).toBeDefined();
    expect(discrepancy_3.deal_id).toBe(deal_id_3);
    expect(discrepancy_3.deal_status).toBe(deal_status_3);
    expect(discrepancy_3.revenue_recognition_date).toEqual(
      revenue_recognition_date_3
    );
    expect(discrepancy_3.invoice_issue_date).toEqual(invoice_issue_date_3);
    expect(discrepancy_3.days_discrepancy).toBe(days_discrepancy_3);
    expect(discrepancy_3.customer_name).toBe("顧客C");
    expect(discrepancy_3.amount).toBe(800000);
    expect(discrepancy_3.is_within_tolerance).toBe(false);
    expect(discrepancy_3.alert_level).toBe("error");

    const no_discrepancy_found = result.discrepancies.find(
      (d: { deal_id: string }) => d.deal_id === deal_id_2
    );
    expect(no_discrepancy_found).toBeUndefined();

    expect(result.summary).toBeDefined();
    expect(result.summary.total_deals_checked).toBe(3);
    expect(result.summary.total_discrepancies_detected).toBe(2);
    expect(result.summary.within_tolerance_count).toBe(0);
    expect(result.summary.exceeded_tolerance_count).toBe(2);
    expect(result.summary.warning_count).toBe(1);
    expect(result.summary.error_count).toBe(1);
  });
});