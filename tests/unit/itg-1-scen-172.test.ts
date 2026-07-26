import { detectDelayedCases } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-172
  test("請求予定日と実際の請求日が同じ日付の案件は遅延案件として判定されない", () => {
    const dealData = {
      deal_id: "D20240115001",
      customer_name: "テスト顧客A",
      status: "成約済み",
      deal_amount: 500000,
      scheduled_invoice_date: new Date("2024-01-15T00:00:00Z"),
      actual_invoice_date: new Date("2024-01-15T00:00:00Z"),
      is_invoiced: true,
    };

    const result = detectDelayedCases([dealData]);

    expect(result).toEqual({
      delayed_cases: [],
      uninvoiced_cases: [],
      on_schedule_cases: [
        {
          deal_id: "D20240115001",
          customer_name: "テスト顧客A",
          status: "成約済み",
          deal_amount: 500000,
          scheduled_invoice_date: new Date("2024-01-15T00:00:00Z"),
          actual_invoice_date: new Date("2024-01-15T00:00:00Z"),
          is_invoiced: true,
          is_delayed: false,
          delay_status: "遅延なし",
          audit_log: "請求日が予定日と一致",
        },
      ],
      total_delayed_count: 0,
      total_uninvoiced_count: 0,
      total_on_schedule_count: 1,
    });

    expect(result.delayed_cases).toHaveLength(0);
    expect(result.on_schedule_cases).toHaveLength(1);
    expect(result.on_schedule_cases[0].is_delayed).toBe(false);
    expect(result.on_schedule_cases[0].delay_status).toBe("遅延なし");
    expect(result.on_schedule_cases[0].audit_log).toMatch(/請求日が予定日と一致/);
  });
});