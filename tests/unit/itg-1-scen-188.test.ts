import { detectDealStatusAndInvoiceDiscrepancy } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-188
  test("売上計上予定日と実際の請求日のズレが0日の場合、ズレなしとして判定される", () => {
    const deal_expected_revenue_date = new Date("2024-01-15T00:00:00Z");
    const invoice_issued_date = new Date("2024-01-15T00:00:00Z");
    const deal_status = "受注";
    const invoice_status = "発行済み";

    const result = detectDealStatusAndInvoiceDiscrepancy({
      deal_status: deal_status,
      deal_expected_revenue_date: deal_expected_revenue_date,
      invoice_issued_date: invoice_issued_date,
      invoice_status: invoice_status,
    });

    expect(result.discrepancy_days).toBe(0);
    expect(result.discrepancy_type).toBe("なし");
    expect(result.reconciliation_status).toBe("正常");
    expect(result.has_anomaly_flag).toBe(false);
    expect(result.warning_message).toBe("");
  });
});