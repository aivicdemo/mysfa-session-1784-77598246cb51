import { extractMonthlyReportData } from "../../src/logic/it-1";

describe("顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能", () => {
  // SCEN-121
  test("月次報告期限・データ抽出処理 - 抽出対象期間内の顧客・商談・活動が時系列順で返される", () => {
    const extraction_start_date = new Date("2024-01-01T00:00:00Z");
    const extraction_end_date = new Date("2024-01-31T23:59:59Z");

    const customer_a = {
      id: "cust_001",
      name: "顧客A",
      created_at: new Date("2024-01-05T09:00:00Z"),
      type: "customer",
    };

    const customer_b = {
      id: "cust_002",
      name: "顧客B",
      created_at: new Date("2024-01-10T10:00:00Z"),
      type: "customer",
    };

    const customer_c = {
      id: "cust_003",
      name: "顧客C",
      created_at: new Date("2024-02-01T09:00:00Z"),
      type: "customer",
    };

    const deal_x = {
      id: "deal_001",
      name: "商談X",
      customer_id: "cust_001",
      created_at: new Date("2024-01-03T08:00:00Z"),
      type: "deal",
    };

    const deal_y = {
      id: "deal_002",
      name: "商談Y",
      customer_id: "cust_002",
      created_at: new Date("2024-01-15T14:00:00Z"),
      type: "deal",
    };

    const deal_z = {
      id: "deal_003",
      name: "商談Z",
      customer_id: "cust_001",
      created_at: new Date("2023-12-25T10:00:00Z"),
      type: "deal",
    };

    const activity_1 = {
      id: "act_001",
      name: "活動1",
      deal_id: "deal_001",
      created_at: new Date("2024-01-04T11:00:00Z"),
      type: "activity",
    };

    const activity_2 = {
      id: "act_002",
      name: "活動2",
      deal_id: "deal_001",
      created_at: new Date("2024-01-12T13:00:00Z"),
      type: "activity",
    };

    const activity_3 = {
      id: "act_003",
      name: "活動3",
      deal_id: "deal_002",
      created_at: new Date("2024-01-20T15:00:00Z"),
      type: "activity",
    };

    const activity_4 = {
      id: "act_004",
      name: "活動4",
      deal_id: "deal_002",
      created_at: new Date("2024-02-05T09:00:00Z"),
      type: "activity",
    };

    const all_records = [
      customer_a,
      customer_b,
      customer_c,
      deal_x,
      deal_y,
      deal_z,
      activity_1,
      activity_2,
      activity_3,
      activity_4,
    ];

    const mock_database = {
      records: all_records,
    };

    const result = extractMonthlyReportData(
      extraction_start_date,
      extraction_end_date,
      mock_database
    );

    expect(result).toHaveLength(7);

    const expected_order = [
      { id: "deal_001", name: "商談X", created_at: new Date("2024-01-03T08:00:00Z") },
      { id: "act_001", name: "活動1", created_at: new Date("2024-01-04T11:00:00Z") },
      { id: "cust_001", name: "顧客A", created_at: new Date("2024-01-05T09:00:00Z") },
      { id: "cust_002", name: "顧客B", created_at: new Date("2024-01-10T10:00:00Z") },
      { id: "act_002", name: "活動2", created_at: new Date("2024-01-12T13:00:00Z") },
      { id: "deal_002", name: "商談Y", created_at: new Date("2024-01-15T14:00:00Z") },
      { id: "act_003", name: "活動3", created_at: new Date("2024-01-20T15:00:00Z") },
    ];

    result.forEach((record, index) => {
      expect(record.id).toBe(expected_order[index].id);
      expect(record.name).toBe(expected_order[index].name);
      expect(record.created_at).toEqual(expected_order[index].created_at);
    });

    const out_of_range_ids = ["cust_003", "deal_003", "act_004"];
    result.forEach((record) => {
      expect(out_of_range_ids).not.toContain(record.id);
    });
  });
});