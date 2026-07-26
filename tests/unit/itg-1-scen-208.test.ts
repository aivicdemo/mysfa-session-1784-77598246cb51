import { detectUnbilledDeals } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-208
  test("ステータスが『受注』かつ請求書が未発行の案件を『未請求案件』として正しく特定できる", () => {
    const test_deals = [
      {
        deal_id: "DEAL_A_001",
        deal_name: "案件A",
        customer_id: "CUST_001",
        customer_name: "顧客A",
        status: "受注",
        amount: 1000000,
        invoice_issued: false,
        invoice_issue_date: null,
        expected_invoice_date: new Date("2024-04-15").toISOString(),
      },
      {
        deal_id: "DEAL_B_002",
        deal_name: "案件B",
        customer_id: "CUST_002",
        customer_name: "顧客B",
        status: "受注",
        amount: 2000000,
        invoice_issued: true,
        invoice_issue_date: new Date("2024-04-10").toISOString(),
        expected_invoice_date: new Date("2024-04-15").toISOString(),
      },
      {
        deal_id: "DEAL_C_003",
        deal_name: "案件C",
        customer_id: "CUST_003",
        customer_name: "顧客C",
        status: "提案中",
        amount: 1500000,
        invoice_issued: false,
        invoice_issue_date: null,
        expected_invoice_date: new Date("2024-05-15").toISOString(),
      },
    ];

    const detection_result = detectUnbilledDeals(test_deals);

    expect(detection_result).toBeDefined();
    expect(detection_result.unbilled_deals).toBeDefined();
    expect(Array.isArray(detection_result.unbilled_deals)).toBe(true);
    expect(detection_result.unbilled_deals.length).toBe(1);

    const detected_deal = detection_result.unbilled_deals[0];
    expect(detected_deal.deal_id).toBe("DEAL_A_001");
    expect(detected_deal.deal_name).toBe("案件A");
    expect(detected_deal.customer_id).toBe("CUST_001");
    expect(detected_deal.customer_name).toBe("顧客A");
    expect(detected_deal.status).toBe("受注");
    expect(detected_deal.amount).toBe(1000000);
    expect(detected_deal.invoice_issued).toBe(false);
    expect(detected_deal.invoice_issue_date).toBeNull();

    expect(detection_result.total_unbilled_count).toBe(1);
    expect(detection_result.total_unbilled_amount).toBe(1000000);

    const not_included_ids = detection_result.unbilled_deals.map(
      (d: { deal_id: string }) => d.deal_id
    );
    expect(not_included_ids).not.toContain("DEAL_B_002");
    expect(not_included_ids).not.toContain("DEAL_C_003");

    expect(detection_result.detection_timestamp).toBeDefined();
  });
});