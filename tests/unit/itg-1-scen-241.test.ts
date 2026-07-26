import { extractBillingTargetData } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  // SCEN-241
  test("請求対象データ抽出機能 - 複数の抽出条件を組み合わせた場合でも正確なデータ抽出が実行される", () => {
    // 前提：営業管理システムに複数の商談レコードが登録されている状態
    const mockBillingData = [
      {
        deal_id: "DEAL001",
        customer_id: "CUST001",
        customer_name: "株式会社A",
        customer_type: "corporate",
        sales_amount: 150000,
        billing_status: "unbilled",
        deal_date: "2024-01-15",
        due_date: "2024-01-31",
      },
      {
        deal_id: "DEAL002",
        customer_id: "CUST002",
        customer_name: "個人B",
        customer_type: "individual",
        sales_amount: 120000,
        billing_status: "unbilled",
        deal_date: "2024-01-20",
        due_date: "2024-01-31",
      },
      {
        deal_id: "DEAL003",
        customer_id: "CUST003",
        customer_name: "株式会社C",
        customer_type: "corporate",
        sales_amount: 250000,
        billing_status: "billed",
        deal_date: "2024-01-10",
        due_date: "2024-01-31",
      },
      {
        deal_id: "DEAL004",
        customer_id: "CUST004",
        customer_name: "株式会社D",
        customer_type: "corporate",
        sales_amount: 80000,
        billing_status: "unbilled",
        deal_date: "2024-01-22",
        due_date: "2024-01-31",
      },
      {
        deal_id: "DEAL005",
        customer_id: "CUST005",
        customer_name: "株式会社E",
        customer_type: "corporate",
        sales_amount: 180000,
        billing_status: "unbilled",
        deal_date: "2023-12-25",
        due_date: "2024-01-31",
      },
    ];

    // 手順：抽出条件を設定する
    // 抽出条件1：請求状態 = "未請求"
    // 抽出条件2：請求対象期間 = 2024-01-01 ～ 2024-01-31
    // 抽出条件3：顧客区分 = "法人"
    // 抽出条件4：売上金額 = 100,000円以上
    const extraction_criteria = {
      billing_status: "unbilled",
      period_start: "2024-01-01",
      period_end: "2024-01-31",
      customer_type: "corporate",
      min_sales_amount: 100000,
    };

    // 期待される抽出結果：
    // DEAL001（150,000円、法人、未請求、2024-01-15）✓
    // DEAL002（120,000円、個人、未請求、2024-01-20）✗ 顧客区分が個人
    // DEAL003（250,000円、法人、既請求、2024-01-10）✗ 請求済み
    // DEAL004（80,000円、法人、未請求、2024-01-22）✗ 売上金額100,000円未満
    // DEAL005（180,000円、法人、未請求、2023-12-25）✗ 期間外
    const result = extractBillingTargetData(mockBillingData, extraction_criteria);

    // 期待：全条件を満たすレコードは DEAL001 のみ
    expect(result.extracted_count).toBe(1);
    expect(result.records.length).toBe(1);
    expect(result.records[0].deal_id).toBe("DEAL001");
    expect(result.records[0].sales_amount).toBe(150000);
    expect(result.records[0].billing_status).toBe("unbilled");
    expect(result.records[0].customer_type).toBe("corporate");

    // 期待：各レコードが条件を満たすことを検証
    result.records.forEach((record) => {
      // 条件1：請求状態が「未請求」
      expect(record.billing_status).toBe("unbilled");
      // 条件2：請求対象期間内
      expect(record.deal_date).toMatch(/^2024-01-/);
      // 条件3：顧客区分が「法人」
      expect(record.customer_type).toBe("corporate");
      // 条件4：売上金額が100,000円以上
      expect(record.sales_amount).toBeGreaterThanOrEqual(100000);
    });

    // 期待：エラーメッセージが存在しない
    expect(result.error_message).toBeUndefined();

    // 期待：出力ファイル形式が指定されている
    expect(result.export_format).toBe("csv");
    expect(result.export_filename).toMatch(/^billing_data_\d{8}_\d{6}\.csv$/);
  });
});