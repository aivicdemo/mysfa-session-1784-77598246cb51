import { filterActivityRecordsByType } from "../../src/logic/it-1";

describe("顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能", () => {
  // SCEN-428
  test("活動記録のタイプフィールドが欠落している場合、当該レコードはフィルタ対象外として除外される", () => {
    const activity_records = [
      {
        id: "act_001",
        type: "call",
        customer_name: "A社",
        created_at: "2024-01-15T10:00:00Z",
      },
      {
        id: "act_002",
        type: "email",
        customer_name: "B社",
        created_at: "2024-01-15T11:00:00Z",
      },
      {
        id: "act_003",
        customer_name: "C社",
        created_at: "2024-01-15T12:00:00Z",
      },
    ];

    const filter_types = ["call", "email"];

    const result = filterActivityRecordsByType(activity_records, filter_types);

    expect(result).toHaveLength(2);
    expect(result[0].customer_name).toBe("A社");
    expect(result[0].type).toBe("call");
    expect(result[1].customer_name).toBe("B社");
    expect(result[1].type).toBe("email");
  });
});