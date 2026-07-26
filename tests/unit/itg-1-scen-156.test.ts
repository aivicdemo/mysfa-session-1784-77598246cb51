import { filterActivityRecordsByType } from "../../src/logic/it-1";

describe("顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能", () => {
  // SCEN-156
  test("活動記録タイプフィルタリング機能 - 選択されたタイプの活動記録が存在しない場合に空の結果セットが返される", () => {
    // Arrange: 存在しないタイプを選択したシナリオを設定
    const activity_records = [
      {
        id: "act_001",
        customer_id: "cust_001",
        activity_type: "email",
        activity_date: "2024-01-15T09:00:00Z",
        description: "顧客メール送付",
      },
      {
        id: "act_002",
        customer_id: "cust_001",
        activity_type: "phone",
        activity_date: "2024-01-14T14:30:00Z",
        description: "顧客電話対応",
      },
      {
        id: "act_003",
        customer_id: "cust_001",
        activity_type: "visit",
        activity_date: "2024-01-13T11:00:00Z",
        description: "顧客訪問",
      },
    ];

    const selected_type = "future_type_not_implemented";

    // Act: 存在しないタイプでフィルタリングを実行
    const result = filterActivityRecordsByType(activity_records, selected_type);

    // Assert: 空の結果セットが返されることを検証
    expect(result.records).toEqual([]);
    expect(result.total_count).toBe(0);
    expect(result.message).toBe("該当する活動記録がありません");
  });
});