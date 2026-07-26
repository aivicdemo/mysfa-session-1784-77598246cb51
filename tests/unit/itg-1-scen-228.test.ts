import { detectUnbilledAndDelayedCases } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-228
  test("月次決算期限3営業日前に未請求案件が正常に検出される", () => {
    // 月次決算期限を設定（例：2024年4月30日）
    const monthly_closing_deadline = new Date("2024-04-30T00:00:00Z");

    // 期限から3営業日前を計算（土日除外）
    // 2024-04-30 (火) から逆算 → 2024-04-25 (木)
    // 2024-04-26 (金) - 1営業日前
    // 2024-04-29 (月) - 2営業日前（日曜挟む）
    // 2024-04-30 (火) - 3営業日前
    const three_business_days_before = new Date("2024-04-25T00:00:00Z");

    // テストデータ：成約済みかつ未請求の案件
    const test_deal = {
      deal_id: "DEAL001",
      customer_id: "CUST001",
      deal_status: "受注",
      deal_amount: 1500000,
      delivery_completed_date: new Date("2024-04-20T00:00:00Z"),
      billing_status: "未請求",
      billing_scheduled_date: new Date("2024-04-25T00:00:00Z"),
    };

    // 複数案件（比較用）
    const deals = [
      test_deal,
      {
        deal_id: "DEAL002",
        customer_id: "CUST002",
        deal_status: "受注",
        deal_amount: 800000,
        delivery_completed_date: new Date("2024-04-18T00:00:00Z"),
        billing_status: "請求済",
        billing_scheduled_date: new Date("2024-04-20T00:00:00Z"),
      },
      {
        deal_id: "DEAL003",
        customer_id: "CUST003",
        deal_status: "提案中",
        deal_amount: 2500000,
        delivery_completed_date: new Date("2024-04-22T00:00:00Z"),
        billing_status: "未請求",
        billing_scheduled_date: new Date("2024-04-28T00:00:00Z"),
      },
    ];

    // 自動照合・ズレ検出機能を実行
    const detection_result = detectUnbilledAndDelayedCases({
      deals: deals,
      current_date: three_business_days_before,
      monthly_closing_deadline: monthly_closing_deadline,
    });

    // 検出結果の検証
    expect(detection_result).toBeDefined();
    expect(detection_result.detected_count).toBe(1);
    expect(detection_result.unbilled_cases).toHaveLength(1);

    // 検出された未請求案件の詳細情報を検証
    const detected_case = detection_result.unbilled_cases[0];
    expect(detected_case.deal_id).toBe("DEAL001");
    expect(detected_case.customer_id).toBe("CUST001");
    expect(detected_case.deal_status).toBe("受注");
    expect(detected_case.deal_amount).toBe(1500000);
    expect(detected_case.delivery_completed_date).toEqual(
      new Date("2024-04-20T00:00:00Z")
    );
    expect(detected_case.billing_status).toBe("未請求");
    expect(detected_case.billing_scheduled_date).toEqual(
      new Date("2024-04-25T00:00:00Z")
    );

    // ズレの種別が『未請求案件』として正しく分類されているか検証
    expect(detected_case.case_type).toBe("未請求案件");
    expect(detected_case.severity).toBe("高");

    // 検出状況のメタデータを検証
    expect(detection_result.detection_timestamp).toBeDefined();
    expect(detection_result.delayed_cases).toHaveLength(0);
    expect(detection_result.total_unbilled_amount).toBe(1500000);
  });
});