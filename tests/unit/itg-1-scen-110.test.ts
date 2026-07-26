import { determineExtractionPeriod } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-110
  test("抽出対象期間自動決定機能 - 抽出対象期間の決定時にアクセス権のない営業担当者のデータが除外される", () => {
    const current_user_id = "user_001";
    const start_date = new Date("2024-04-01T00:00:00Z");
    const end_date = new Date("2024-04-30T23:59:59Z");

    const accessible_salespeople = [
      {
        salesperson_id: "sales_001",
        name: "Tanaka",
      },
      {
        salesperson_id: "sales_002",
        name: "Suzuki",
      },
    ];

    const all_salespeople = [
      {
        salesperson_id: "sales_001",
        name: "Tanaka",
      },
      {
        salesperson_id: "sales_002",
        name: "Suzuki",
      },
      {
        salesperson_id: "sales_003",
        name: "InaccessibleUser",
      },
    ];

    const deals_in_period = [
      {
        deal_id: "deal_001",
        salesperson_id: "sales_001",
        amount: 100000,
        status: "won",
        created_at: new Date("2024-04-10T10:00:00Z"),
      },
      {
        deal_id: "deal_002",
        salesperson_id: "sales_002",
        amount: 150000,
        status: "won",
        created_at: new Date("2024-04-15T14:00:00Z"),
      },
      {
        deal_id: "deal_003",
        salesperson_id: "sales_003",
        amount: 200000,
        status: "won",
        created_at: new Date("2024-04-20T09:00:00Z"),
      },
    ];

    const result = determineExtractionPeriod({
      current_user_id,
      start_date,
      end_date,
      accessible_salespeople,
      all_salespeople,
      deals_in_period,
    });

    expect(result.extraction_start_date).toEqual(start_date);
    expect(result.extraction_end_date).toEqual(end_date);

    expect(result.extracted_deals).toHaveLength(2);
    expect(result.extracted_deals.map((d) => d.deal_id)).toEqual([
      "deal_001",
      "deal_002",
    ]);

    const salesperson_ids_in_result = result.extracted_deals.map(
      (d) => d.salesperson_id
    );
    expect(salesperson_ids_in_result).toContain("sales_001");
    expect(salesperson_ids_in_result).toContain("sales_002");
    expect(salesperson_ids_in_result).not.toContain("sales_003");

    expect(result.access_control_applied).toBe(true);
    expect(result.excluded_deals_count).toBe(1);
  });
});