import {
  detectUnbilledAndDelayedCases,
} from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-684
  test("[normal] 月次決算期限3営業日前に照合開始時、未請求案件が複数件の場合、全案件が検出結果に含まれる", () => {
    const current_date_time = new Date("2024-04-27T09:00:00Z");
    const settlement_deadline = new Date("2024-05-03T23:59:59Z");

    const test_deal_records = [
      {
        deal_id: "DEAL-001",
        customer_id: "CUST-100",
        deal_status: "成約",
        deal_amount: 500000,
        deal_closed_date: new Date("2024-04-20T10:30:00Z"),
        invoice_status: "未請求",
        invoice_issued_date: null,
        invoice_amount: null,
        expected_billing_date: new Date("2024-04-25T00:00:00Z"),
      },
      {
        deal_id: "DEAL-002",
        customer_id: "CUST-200",
        deal_status: "成約",
        deal_amount: 1200000,
        deal_closed_date: new Date("2024-04-18T14:00:00Z"),
        invoice_status: "未請求",
        invoice_issued_date: null,
        invoice_amount: null,
        expected_billing_date: new Date("2024-04-23T00:00:00Z"),
      },
      {
        deal_id: "DEAL-003",
        customer_id: "CUST-300",
        deal_status: "成約",
        deal_amount: 750000,
        deal_closed_date: new Date("2024-04-22T11:15:00Z"),
        invoice_status: "未請求",
        invoice_issued_date: null,
        invoice_amount: null,
        expected_billing_date: new Date("2024-04-27T00:00:00Z"),
      },
    ];

    const detection_result = detectUnbilledAndDelayedCases(
      test_deal_records,
      current_date_time,
      settlement_deadline
    );

    expect(detection_result).toBeDefined();
    expect(Array.isArray(detection_result)).toBe(true);
    expect(detection_result.length).toBe(3);

    const detected_deal_ids = detection_result.map((item: any) => item.deal_id);
    expect(detected_deal_ids).toContain("DEAL-001");
    expect(detected_deal_ids).toContain("DEAL-002");
    expect(detected_deal_ids).toContain("DEAL-003");

    detection_result.forEach((result: any) => {
      expect(result.deal_status).toBe("成約");
      expect(result.invoice_status).toBe("未請求");
      expect(result.discrepancy_type).toBe("未請求案件");
      expect(result.detection_timestamp).toBeDefined();
      const detection_time = new Date(result.detection_timestamp);
      expect(detection_time.getTime()).toBeGreaterThanOrEqual(
        current_date_time.getTime()
      );
    });

    const result_for_deal_001 = detection_result.find(
      (item: any) => item.deal_id === "DEAL-001"
    );
    expect(result_for_deal_001).toBeDefined();
    expect(result_for_deal_001.customer_id).toBe("CUST-100");
    expect(result_for_deal_001.deal_amount).toBe(500000);

    const result_for_deal_002 = detection_result.find(
      (item: any) => item.deal_id === "DEAL-002"
    );
    expect(result_for_deal_002).toBeDefined();
    expect(result_for_deal_002.customer_id).toBe("CUST-200");
    expect(result_for_deal_002.deal_amount).toBe(1200000);

    const result_for_deal_003 = detection_result.find(
      (item: any) => item.deal_id === "DEAL-003"
    );
    expect(result_for_deal_003).toBeDefined();
    expect(result_for_deal_003.customer_id).toBe("CUST-300");
    expect(result_for_deal_003.deal_amount).toBe(750000);

    const unique_deal_ids = new Set(detected_deal_ids);
    expect(unique_deal_ids.size).toBe(detected_deal_ids.length);
  });
});