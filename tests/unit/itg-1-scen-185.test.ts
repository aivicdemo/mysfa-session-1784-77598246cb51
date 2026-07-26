import { filterPurchaseHistoryByPeriod } from "../../src/logic/it-1";

describe("顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能", () => {
  test("SCEN-185: 過去購買履歴フィルタリング機能 - 設定対象期間外の購買履歴は表示対象から除外される", () => {
    // 設定対象期間: 2024年1月1日～2024年3月31日
    const period_start = new Date("2024-01-01T00:00:00Z");
    const period_end = new Date("2024-03-31T23:59:59Z");

    // テスト用の購買履歴データ
    // 対象期間内: 2024-01-15, 2024-02-20, 2024-03-10
    // 対象期間外（前）: 2023-12-15
    // 対象期間外（後）: 2024-04-05, 2024-05-01
    const purchase_records = [
      {
        purchase_id: "PH001",
        customer_id: "CUST001",
        purchase_date: new Date("2023-12-15T10:00:00Z"),
        amount: 50000,
      },
      {
        purchase_id: "PH002",
        customer_id: "CUST001",
        purchase_date: new Date("2024-01-15T10:00:00Z"),
        amount: 100000,
      },
      {
        purchase_id: "PH003",
        customer_id: "CUST001",
        purchase_date: new Date("2024-02-20T14:30:00Z"),
        amount: 75000,
      },
      {
        purchase_id: "PH004",
        customer_id: "CUST001",
        purchase_date: new Date("2024-03-10T09:15:00Z"),
        amount: 120000,
      },
      {
        purchase_id: "PH005",
        customer_id: "CUST001",
        purchase_date: new Date("2024-04-05T11:00:00Z"),
        amount: 60000,
      },
      {
        purchase_id: "PH006",
        customer_id: "CUST001",
        purchase_date: new Date("2024-05-01T16:45:00Z"),
        amount: 80000,
      },
    ];

    // フィルタリング処理を実行
    const filtered_records = filterPurchaseHistoryByPeriod(
      purchase_records,
      period_start,
      period_end
    );

    // 期待結果: 対象期間内の3件のみが返される
    // PH002 (2024-01-15), PH003 (2024-02-20), PH004 (2024-03-10)
    expect(filtered_records).toHaveLength(3);

    // 返されたレコードのpurchase_idを確認
    const filtered_ids = filtered_records.map((r) => r.purchase_id);
    expect(filtered_ids).toEqual(["PH002", "PH003", "PH004"]);

    // 各レコードの日付が対象期間内であることを確認
    filtered_records.forEach((record) => {
      const record_date = new Date(record.purchase_date);
      expect(record_date.getTime()).toBeGreaterThanOrEqual(
        period_start.getTime()
      );
      expect(record_date.getTime()).toBeLessThanOrEqual(period_end.getTime());
    });

    // 対象期間外のレコードが含まれていないことを確認
    const all_ids = purchase_records.map((r) => r.purchase_id);
    const excluded_ids = all_ids.filter(
      (id) => !filtered_ids.includes(id)
    );
    expect(excluded_ids).toEqual(["PH001", "PH005", "PH006"]);

    // 合計金額の検証
    // 対象期間内: 100000 + 75000 + 120000 = 295000
    const total_amount = filtered_records.reduce(
      (sum, record) => sum + record.amount,
      0
    );
    expect(total_amount).toBe(295000);

    // 対象期間外のレコードが一切含まれていないことをダブルチェック
    const has_out_of_period = filtered_records.some((record) => {
      const record_date = new Date(record.purchase_date);
      return (
        record_date < period_start || record_date > period_end
      );
    });
    expect(has_out_of_period).toBe(false);
  });
});