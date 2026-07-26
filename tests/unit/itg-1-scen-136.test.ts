import { detectUnbilledAndDelayedDeals } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-136
  test("未請求・遅延案件の自動フラグ付与 - 商談ステータス『受注』で請求未実施の案件に警告フラグが自動付与される", () => {
    // Arrange: 商談ステータスが『受注』で、請求がまだ実施されていない案件データを準備
    const deal_input = {
      deal_id: "DEAL-001",
      deal_name: "新規案件A",
      customer_id: "CUST-100",
      customer_name: "サンプル顧客",
      deal_amount: 500000,
      deal_status: "受注",
      invoice_issued_date: null,
      invoice_planned_date: "2024-02-15",
      invoice_status: "未請求",
      created_date: "2024-02-01T10:00:00Z",
      updated_date: "2024-02-01T10:00:00Z"
    };

    // Act: システムが商談ステータスと請求状況を照合し、フラグ付与処理を実行
    const result = detectUnbilledAndDelayedDeals([deal_input]);

    // Assert: 未請求案件に警告フラグが自動付与されていることを検証
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      deal_id: "DEAL-001",
      deal_name: "新規案件A",
      customer_id: "CUST-100",
      customer_name: "サンプル顧客",
      deal_amount: 500000,
      deal_status: "受注",
      invoice_issued_date: null,
      invoice_planned_date: "2024-02-15",
      invoice_status: "未請求",
      warning_flag: true,
      issue_type: "未請求案件",
      created_date: "2024-02-01T10:00:00Z",
      updated_date: "2024-02-01T10:00:00Z"
    });

    // 案件詳細画面での警告フラグ表示を検証
    expect(result[0].warning_flag).toBe(true);

    // 案件一覧画面での警告フラグ表示を検証
    const list_view_result = result.filter(
      (deal) => deal.deal_id === "DEAL-001"
    );
    expect(list_view_result).toHaveLength(1);
    expect(list_view_result[0].warning_flag).toBe(true);
    expect(list_view_result[0].issue_type).toBe("未請求案件");

    // 複数案件がある場合の動作検証
    const multiple_deals = [
      deal_input,
      {
        deal_id: "DEAL-002",
        deal_name: "新規案件B",
        customer_id: "CUST-101",
        customer_name: "別顧客",
        deal_amount: 300000,
        deal_status: "受注",
        invoice_issued_date: "2024-02-01T15:00:00Z",
        invoice_planned_date: "2024-02-15",
        invoice_status: "請求済み",
        created_date: "2024-02-01T09:00:00Z",
        updated_date: "2024-02-01T09:00:00Z"
      },
      {
        deal_id: "DEAL-003",
        deal_name: "新規案件C",
        customer_id: "CUST-102",
        customer_name: "予定顧客",
        deal_amount: 200000,
        deal_status: "提案中",
        invoice_issued_date: null,
        invoice_planned_date: "2024-03-01",
        invoice_status: "未請求",
        created_date: "2024-02-01T11:00:00Z",
        updated_date: "2024-02-01T11:00:00Z"
      }
    ];

    const multiple_result = detectUnbilledAndDelayedDeals(multiple_deals);

    // DEAL-001: 受注 + 未請求 = 警告フラグあり
    const deal_001_result = multiple_result.find(
      (d) => d.deal_id === "DEAL-001"
    );
    expect(deal_001_result?.warning_flag).toBe(true);
    expect(deal_001_result?.issue_type).toBe("未請求案件");

    // DEAL-002: 受注 + 請求済み = 警告フラグなし
    const deal_002_result = multiple_result.find(
      (d) => d.deal_id === "DEAL-002"
    );
    expect(deal_002_result?.warning_flag).toBe(false);

    // DEAL-003: 提案中 + 未請求 = 警告フラグなし（受注ステータスではないため）
    const deal_003_result = multiple_result.find(
      (d) => d.deal_id === "DEAL-003"
    );
    expect(deal_003_result?.warning_flag).toBe(false);

    // 遅延案件の検出ロジック：請求予定日を超過した受注案件
    const delayed_deal = {
      deal_id: "DEAL-004",
      deal_name: "遅延案件",
      customer_id: "CUST-103",
      customer_name: "遅延顧客",
      deal_amount: 150000,
      deal_status: "受注",
      invoice_issued_date: null,
      invoice_planned_date: "2024-01-31",
      invoice_status: "未請求",
      created_date: "2024-01-15T10:00:00Z",
      updated_date: "2024-01-15T10:00:00Z"
    };

    const delayed_result = detectUnbilledAndDelayedDeals([delayed_deal]);
    expect(delayed_result[0].warning_flag).toBe(true);
    expect(delayed_result[0].issue_type).toBe("未請求案件");
  });
});