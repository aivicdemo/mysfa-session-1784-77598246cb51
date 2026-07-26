import { detectDelayedInvoiceCase } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル - 売上実績と請求状況の照合機能", () => {
  // SCEN-050
  test("should detect delayed invoice cases when invoice issuance date is 30+ days after deal status update", () => {
    const deal_status_update_date = new Date("2024-01-15T00:00:00Z");
    const invoice_issue_date = new Date("2024-02-15T00:00:00Z");
    const days_threshold = 30;

    const result = detectDelayedInvoiceCase({
      deal_id: "DEAL-001",
      customer_id: "CUST-001",
      deal_status: "完了",
      deal_status_update_date: deal_status_update_date,
      invoice_issue_date: invoice_issue_date,
      invoice_amount: 150000,
      days_threshold: days_threshold,
    });

    expect(result.is_delayed).toBe(true);
    expect(result.days_difference).toBe(31);
    expect(result.delay_reason).toBe("請求書発行の遅延");
    expect(result.detection_status).toBe("遅延案件");
    expect(result.alert_flag).toBe(true);
  });

  test("should not detect delayed invoice cases when invoice issuance date is within threshold", () => {
    const deal_status_update_date = new Date("2024-01-15T00:00:00Z");
    const invoice_issue_date = new Date("2024-01-20T00:00:00Z");
    const days_threshold = 30;

    const result = detectDelayedInvoiceCase({
      deal_id: "DEAL-002",
      customer_id: "CUST-002",
      deal_status: "完了",
      deal_status_update_date: deal_status_update_date,
      invoice_issue_date: invoice_issue_date,
      invoice_amount: 200000,
      days_threshold: days_threshold,
    });

    expect(result.is_delayed).toBe(false);
    expect(result.days_difference).toBe(5);
    expect(result.delay_reason).toBe("");
    expect(result.detection_status).toBe("正常");
    expect(result.alert_flag).toBe(false);
  });

  test("should detect delayed invoice cases at exact threshold boundary", () => {
    const deal_status_update_date = new Date("2024-01-15T00:00:00Z");
    const invoice_issue_date = new Date("2024-02-14T00:00:00Z");
    const days_threshold = 30;

    const result = detectDelayedInvoiceCase({
      deal_id: "DEAL-003",
      customer_id: "CUST-003",
      deal_status: "受注",
      deal_status_update_date: deal_status_update_date,
      invoice_issue_date: invoice_issue_date,
      invoice_amount: 300000,
      days_threshold: days_threshold,
    });

    expect(result.is_delayed).toBe(false);
    expect(result.days_difference).toBe(30);
    expect(result.detection_status).toBe("正常");
    expect(result.alert_flag).toBe(false);
  });

  test("should detect delayed invoice cases when exceeding threshold by 1 day", () => {
    const deal_status_update_date = new Date("2024-01-15T00:00:00Z");
    const invoice_issue_date = new Date("2024-02-15T00:00:00Z");
    const days_threshold = 30;

    const result = detectDelayedInvoiceCase({
      deal_id: "DEAL-004",
      customer_id: "CUST-004",
      deal_status: "完了",
      deal_status_update_date: deal_status_update_date,
      invoice_issue_date: invoice_issue_date,
      invoice_amount: 250000,
      days_threshold: days_threshold,
    });

    expect(result.is_delayed).toBe(true);
    expect(result.days_difference).toBe(31);
    expect(result.delay_reason).toBe("請求書発行の遅延");
    expect(result.detection_status).toBe("遅延案件");
    expect(result.alert_flag).toBe(true);
  });

  test("should handle multiple delayed cases in batch detection", () => {
    const cases = [
      {
        deal_id: "DEAL-005",
        customer_id: "CUST-005",
        deal_status: "完了",
        deal_status_update_date: new Date("2024-01-01T00:00:00Z"),
        invoice_issue_date: new Date("2024-02-05T00:00:00Z"),
        invoice_amount: 100000,
        days_threshold: 30,
      },
      {
        deal_id: "DEAL-006",
        customer_id: "CUST-006",
        deal_status: "受注",
        deal_status_update_date: new Date("2024-01-10T00:00:00Z"),
        invoice_issue_date: new Date("2024-01-15T00:00:00Z"),
        invoice_amount: 150000,
        days_threshold: 30,
      },
    ];

    const results = cases.map((caseData) =>
      detectDelayedInvoiceCase(caseData)
    );

    expect(results[0].is_delayed).toBe(true);
    expect(results[0].days_difference).toBe(35);
    expect(results[0].delay_reason).toBe("請求書発行の遅延");
    expect(results[0].alert_flag).toBe(true);

    expect(results[1].is_delayed).toBe(false);
    expect(results[1].days_difference).toBe(5);
    expect(results[1].alert_flag).toBe(false);
  });

  test("should throw error when deal_status_update_date is missing", () => {
    expect(() =>
      detectDelayedInvoiceCase({
        deal_id: "DEAL-007",
        customer_id: "CUST-007",
        deal_status: "完了",
        deal_status_update_date: null as any,
        invoice_issue_date: new Date("2024-02-15T00:00:00Z"),
        invoice_amount: 200000,
        days_threshold: 30,
      })
    ).toThrow(/商談ステータス更新日/);
  });

  test("should throw error when invoice_issue_date is missing", () => {
    expect(() =>
      detectDelayedInvoiceCase({
        deal_id: "DEAL-008",
        customer_id: "CUST-008",
        deal_status: "完了",
        deal_status_update_date: new Date("2024-01-15T00:00:00Z"),
        invoice_issue_date: null as any,
        invoice_amount: 200000,
        days_threshold: 30,
      })
    ).toThrow(/請求書発行日/);
  });

  test("should throw error when days_threshold is invalid", () => {
    expect(() =>
      detectDelayedInvoiceCase({
        deal_id: "DEAL-009",
        customer_id: "CUST-009",
        deal_status: "完了",
        deal_status_update_date: new Date("2024-01-15T00:00:00Z"),
        invoice_issue_date: new Date("2024-02-15T00:00:00Z"),
        invoice_amount: 200000,
        days_threshold: -1,
      })
    ).toThrow(/閾値/);
  });

  test("should return correct delay status with large date gap", () => {
    const deal_status_update_date = new Date("2024-01-01T00:00:00Z");
    const invoice_issue_date = new Date("2024-04-01T00:00:00Z");
    const days_threshold = 30;

    const result = detectDelayedInvoiceCase({
      deal_id: "DEAL-010",
      customer_id: "CUST-010",
      deal_status: "完了",
      deal_status_update_date: deal_status_update_date,
      invoice_issue_date: invoice_issue_date,
      invoice_amount: 500000,
      days_threshold: days_threshold,
    });

    expect(result.is_delayed).toBe(true);
    expect(result.days_difference).toBe(91);
    expect(result.delay_reason).toBe("請求書発行の遅延");
    expect(result.detection_status).toBe("遅延案件");
    expect(result.alert_flag).toBe(true);
  });
});