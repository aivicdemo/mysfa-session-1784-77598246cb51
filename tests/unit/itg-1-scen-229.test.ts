import {
  detectDelayedDealsByDeadline,
} from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-229: [normal] 商談ステータスと請求書発行状況の自動照合・ズレ検出機能 - 月次決算期限3営業日前に遅延案件が正常に検出される
  test("月次決算期限の3営業日前の時点で、請求書が発行されていない『契約済み』商談が遅延案件として正常に検出される", () => {
    // 基準日時: 2024-04-10 (月次決算期限)
    // 3営業日前: 2024-04-05 (金曜日)
    const monthly_settlement_deadline = new Date("2024-04-10T00:00:00Z");
    const detection_reference_date = new Date("2024-04-05T00:00:00Z");

    // テスト用商談データセット
    const deals = [
      {
        deal_id: "DEAL-001",
        customer_id: "CUST-001",
        deal_name: "契約済み案件（請求済み）",
        status: "契約済み",
        deal_amount: 1000000,
        invoice_expected_date: new Date("2024-03-31T00:00:00Z"),
        invoice_actual_date: new Date("2024-03-31T00:00:00Z"),
        is_invoiced: true,
        created_date: new Date("2024-03-01T00:00:00Z"),
      },
      {
        deal_id: "DEAL-002",
        customer_id: "CUST-002",
        deal_name: "契約済み案件（未請求・遅延）",
        status: "契約済み",
        deal_amount: 2000000,
        invoice_expected_date: new Date("2024-03-25T00:00:00Z"),
        invoice_actual_date: null,
        is_invoiced: false,
        created_date: new Date("2024-03-01T00:00:00Z"),
      },
      {
        deal_id: "DEAL-003",
        customer_id: "CUST-003",
        deal_name: "提案中案件",
        status: "提案中",
        deal_amount: 500000,
        invoice_expected_date: new Date("2024-04-15T00:00:00Z"),
        invoice_actual_date: null,
        is_invoiced: false,
        created_date: new Date("2024-03-05T00:00:00Z"),
      },
      {
        deal_id: "DEAL-004",
        customer_id: "CUST-004",
        deal_name: "契約済み案件（直近請求済み）",
        status: "契約済み",
        deal_amount: 1500000,
        invoice_expected_date: new Date("2024-04-01T00:00:00Z"),
        invoice_actual_date: new Date("2024-04-01T00:00:00Z"),
        is_invoiced: true,
        created_date: new Date("2024-03-10T00:00:00Z"),
      },
    ];

    // 遅延案件検出処理を実行
    const detection_result = detectDelayedDealsByDeadline({
      deals: deals,
      detection_reference_date: detection_reference_date,
      monthly_settlement_deadline: monthly_settlement_deadline,
    });

    // 遅延案件が正常に検出されることを検証
    expect(detection_result.delayed_deals).toHaveLength(1);

    // 遅延案件の詳細情報を検証
    const delayed_deal = detection_result.delayed_deals[0];
    expect(delayed_deal.deal_id).toBe("DEAL-002");
    expect(delayed_deal.customer_id).toBe("CUST-002");
    expect(delayed_deal.deal_name).toBe("契約済み案件（未請求・遅延）");
    expect(delayed_deal.status).toBe("契約済み");
    expect(delayed_deal.deal_amount).toBe(2000000);
    expect(delayed_deal.invoice_expected_date).toEqual(
      new Date("2024-03-25T00:00:00Z")
    );
    expect(delayed_deal.is_invoiced).toBe(false);

    // 遅延日数を検証: 2024-04-05 - 2024-03-25 = 11日間
    expect(delayed_deal.delay_days).toBe(11);

    // 自動設定された優先度を検証
    expect(delayed_deal.priority).toBe("高");

    // 自動アラート通知が設定されていることを検証
    expect(delayed_deal.alert_notification_sent).toBe(true);
    expect(delayed_deal.alert_notification_timestamp).toBeDefined();

    // 検出結果の統計情報を検証
    expect(detection_result.total_detected_delayed_deals).toBe(1);
    expect(detection_result.total_invoiced_deals).toBe(2);
    expect(detection_result.total_pending_deals).toBe(1);

    // 検出ステータスが成功であることを検証
    expect(detection_result.detection_status).toBe("success");

    // 検出実行時刻が記録されていることを検証
    expect(detection_result.detection_executed_at).toBeDefined();
  });
});