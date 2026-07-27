import { fetchActivityRecords } from "../../src/logic/it-1";

describe("顧客レコード画面の活動記録表示機能", () => {
  test("SCEN-409: 活動記録フィルタリング機能 - フィルタ適用前に活動記録が0件の場合、フィルタ適用後も0件が返される", async () => {
    // 初期状態: 活動記録データベースが空
    const emptyActivityDatabase = [];

    // フィルタ条件を設定（活動日付範囲、活動タイプ、営業担当者）
    const filterConditions = {
      activityDateStart: "2024-01-01",
      activityDateEnd: "2024-12-31",
      activityTypes: ["email", "phone", "visit"],
      salesPersonId: "SP001",
    };

    // フィルタを適用して活動記録を取得
    const result = await fetchActivityRecords(
      emptyActivityDatabase,
      filterConditions
    );

    // 期待結果: フィルタ適用後も活動記録は0件
    expect(result.records).toEqual([]);
    expect(result.totalCount).toBe(0);
    expect(result.message).toBe("該当する活動記録はありません");
  });
});