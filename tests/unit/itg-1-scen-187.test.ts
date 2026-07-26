import { describe, test, expect, beforeEach } from "@jest/globals";
import { filterPurchaseHistoryByDateRange } from "../../src/logic/it-1";

describe("顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能", () => {
  // SCEN-187: [edge] 過去購買履歴フィルタリング機能 - 対象期間の終了日が現在日付と同じ場合、当日の購買履歴が含まれる
  test("対象期間の終了日が現在日付と同じ場合、当日の購買履歴がすべて含まれること", () => {
    // 固定の現在日付を設定
    const today = new Date("2024-04-15T00:00:00Z");
    const todayEnd = new Date("2024-04-15T23:59:59Z");
    const thirtyDaysAgo = new Date("2024-03-16T00:00:00Z");

    // テスト対象のデータセット
    // 当日の00:00:00より前の購買履歴
    const purchaseBeforeToday = {
      purchase_id: "P001",
      customer_id: "C001",
      purchase_date: new Date("2024-04-14T18:30:00Z"),
      amount: 100000,
    };

    // 当日の00:00:01の購買履歴
    const purchaseAtTodayStart = {
      purchase_id: "P002",
      customer_id: "C001",
      purchase_date: new Date("2024-04-15T00:00:01Z"),
      amount: 50000,
    };

    // 当日の12:00:00の購買履歴
    const purchaseAtTodayMidday = {
      purchase_id: "P003",
      customer_id: "C001",
      purchase_date: new Date("2024-04-15T12:00:00Z"),
      amount: 75000,
    };

    // 当日の23:59:59の購買履歴
    const purchaseAtTodayEnd = {
      purchase_id: "P004",
      customer_id: "C001",
      purchase_date: new Date("2024-04-15T23:59:59Z"),
      amount: 60000,
    };

    // 当日の23:59:59を超える購買履歴
    const purchaseAfterToday = {
      purchase_id: "P005",
      customer_id: "C001",
      purchase_date: new Date("2024-04-16T00:00:00Z"),
      amount: 85000,
    };

    const purchaseHistory = [
      purchaseBeforeToday,
      purchaseAtTodayStart,
      purchaseAtTodayMidday,
      purchaseAtTodayEnd,
      purchaseAfterToday,
    ];

    // フィルタリング実行
    const result = filterPurchaseHistoryByDateRange({
      purchase_records: purchaseHistory,
      start_date: thirtyDaysAgo,
      end_date: today,
      customer_id: "C001",
    });

    // 期待値: 当日の00:00:01から23:59:59までの購買履歴がすべて含まれること
    expect(result.filtered_records).toHaveLength(3);

    // 当日の購買履歴が正しく抽出されたことを確認
    const filteredPurchaseIds = result.filtered_records.map(
      (record: { purchase_id: string }) => record.purchase_id
    );
    expect(filteredPurchaseIds).toContain("P002");
    expect(filteredPurchaseIds).toContain("P003");
    expect(filteredPurchaseIds).toContain("P004");

    // 当日より前の購買履歴は含まれていない
    expect(filteredPurchaseIds).not.toContain("P001");

    // 当日より後の購買履歴は含まれていない
    expect(filteredPurchaseIds).not.toContain("P005");

    // 当日の購買履歴の金額合計を検証
    const todayTotalAmount = result.filtered_records.reduce(
      (sum: number, record: { amount: number }) => sum + record.amount,
      0
    );
    expect(todayTotalAmount).toBe(185000);

    // フィルタリング結果が時系列（新しい順）でソートされていることを確認
    for (
      let i = 0;
      i < result.filtered_records.length - 1;
      i++
    ) {
      const currentTime = new Date(
        result.filtered_records[i].purchase_date
      ).getTime();
      const nextTime = new Date(
        result.filtered_records[i + 1].purchase_date
      ).getTime();
      expect(currentTime).toBeGreaterThanOrEqual(nextTime);
    }

    // フィルタリング条件の検証ステータス
    expect(result.filter_status).toBe("completed");

    // 含まれる最も早い購買日時が開始日以降であることを確認
    const earliestPurchaseTime = new Date(
      result.filtered_records[result.filtered_records.length - 1].purchase_date
    ).getTime();
    expect(earliestPurchaseTime).toBeGreaterThanOrEqual(
      thirtyDaysAgo.getTime()
    );

    // 含まれる最も遅い購買日時が終了日以前であることを確認
    const latestPurchaseTime = new Date(
      result.filtered_records[0].purchase_date
    ).getTime();
    expect(latestPurchaseTime).toBeLessThanOrEqual(todayEnd.getTime());
  });
});