import { detectDealStatusInvoiceMismatch } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-129
  test("商談ステータス『受注』で請求書発行日が予定日より30日遅延している場合、遅延案件として検出される", () => {
    const baseline_date = new Date("2024-01-01T00:00:00Z");
    const delayed_invoice_date = new Date("2024-01-31T00:00:00Z");
    const delay_days = 30;

    const deal_record = {
      deal_id: "DEAL-001",
      customer_id: "CUST-001",
      status: "受注",
      amount: 1000000,
      scheduled_invoice_date: baseline_date,
      actual_invoice_date: delayed_invoice_date,
    };

    const result = detectDealStatusInvoiceMismatch({
      deals: [deal_record],
      current_date: new Date("2024-02-01T00:00:00Z"),
    });

    expect(result).toEqual({
      delayed_deals: [
        {
          deal_id: "DEAL-001",
          customer_id: "CUST-001",
          status: "遅延",
          delay_days: delay_days,
          scheduled_invoice_date: baseline_date,
          actual_invoice_date: delayed_invoice_date,
          amount: 1000000,
        },
      ],
      unpaid_deals: [],
      total_delayed_count: 1,
      total_unpaid_count: 0,
    });

    expect(result.delayed_deals).toHaveLength(1);
    expect(result.delayed_deals[0].delay_days).toBe(30);
    expect(result.delayed_deals[0].status).toBe("遅延");
    expect(result.total_delayed_count).toBe(1);
  });
});