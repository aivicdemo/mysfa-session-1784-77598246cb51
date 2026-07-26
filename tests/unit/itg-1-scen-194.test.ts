import { filterActivityRecordsByType } from "../../src/logic/it-1";

describe("顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能", () => {
  // SCEN-194
  test("活動記録タイプフィルタリング機能 - 指定されたタイプに該当する活動記録が存在しない場合に空の配列が返される", () => {
    const activity_records = [
      {
        id: "activity_001",
        type: "email",
        description: "顧客へのメール送信",
        created_at: "2024-01-10T10:00:00Z",
      },
      {
        id: "activity_002",
        type: "phone",
        description: "顧客との電話対応",
        created_at: "2024-01-11T14:30:00Z",
      },
      {
        id: "activity_003",
        type: "visit",
        description: "顧客訪問",
        created_at: "2024-01-12T09:00:00Z",
      },
    ];

    const non_existent_type = "存在しないタイプ001";

    const result = filterActivityRecordsByType(activity_records, non_existent_type);

    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});