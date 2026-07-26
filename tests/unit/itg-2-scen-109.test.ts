import { detectUnbilledDealsByBillingDueDate } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル - 未請求案件自動検出機能", () => {
  // SCEN-109
  test("検出日が請求発行予定日と完全に一致する案件が境界値として正確に検出される", () => {
    const detection_date = new Date("2024-01-15T09:00:00Z");
    const billing_due_date = new Date("2024-01-15T09:00:00Z");

    const deals = [
      {
        deal_id: "DEAL001",
        customer_id: "CUST001",
        customer_name: "テスト顧客A",
        deal_amount: 500000,
        deal_status: "受注",
        billing_due_date: billing_due_date,
        invoice_issued_date: null,
        is_billed: false,
      },
      {
        deal_id: "DEAL002",
        customer_id: "CUST002",
        customer_name: "テスト顧客B",
        deal_amount: 300000,
        deal_status: "受注",
        billing_due_date: new Date("2024-01-16T09:00:00Z"),
        invoice_issued_date: null,
        is_billed: false,
      },
      {
        deal_id: "DEAL003",
        customer_id: "CUST001",
        customer_name: "テスト顧客A",
        deal_amount: 200000,
        deal_status: "受注",
        billing_due_date: new Date("2024-01-14T09:00:00Z"),
        invoice_issued_date: null,
        is_billed: false,
      },
    ];

    const result = detectUnbilledDealsByBillingDueDate(deals, detection_date);

    expect(result).toEqual({
      detection_timestamp: "2024-01-15T09:00:00Z",
      boundary_matched_deals: [
        {
          deal_id: "DEAL001",
          customer_id: "CUST001",
          customer_name: "テスト顧客A",
          deal_amount: 500000,
          deal_status: "受注",
          billing_due_date: "2024-01-15T09:00:00Z",
          invoice_issued_date: null,
          is_billed: false,
          detection_date: "2024-01-15T09:00:00Z",
          match_type: "exact_boundary",
        },
      ],
      total_detected_count: 1,
      boundary_exact_match_count: 1,
      system_log_entry: {
        event_type: "unbilled_deal_detection",
        detection_timestamp: "2024-01-15T09:00:00Z",
        deals_detected: 1,
        boundary_matches: 1,
      },
    });

    expect(result.detection_timestamp).toBe("2024-01-15T09:00:00Z");
    expect(result.boundary_matched_deals.length).toBe(1);
    expect(result.boundary_matched_deals[0].deal_id).toBe("DEAL001");
    expect(result.boundary_exact_match_count).toBe(1);
    expect(
      result.boundary_matched_deals[0].detection_date ===
        result.boundary_matched_deals[0].billing_due_date
    ).toBe(true);
    expect(result.system_log_entry.event_type).toBe(
      "unbilled_deal_detection"
    );
  });
});