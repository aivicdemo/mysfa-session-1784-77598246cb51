import { filterPurchaseHistoryByPeriod } from "../../src/logic/it-1";

describe("顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能", () => {
  // SCEN-146
  test("[normal] 過去購買履歴フィルタリング機能 - 設定された対象期間内の購買履歴のみが正しくフィルタリングされて表示される", () => {
    const purchase_history = [
      {
        purchase_id: "PH001",
        customer_id: "CUST001",
        purchase_date: new Date("2023-12-15"),
        amount: 50000,
        product_name: "製品A",
      },
      {
        purchase_id: "PH002",
        customer_id: "CUST001",
        purchase_date: new Date("2024-01-10"),
        amount: 100000,
        product_name: "製品B",
      },
      {
        purchase_id: "PH003",
        customer_id: "CUST001",
        purchase_date: new Date("2024-02-20"),
        amount: 75000,
        product_name: "製品C",
      },
      {
        purchase_id: "PH004",
        customer_id: "CUST001",
        purchase_date: new Date("2024-03-30"),
        amount: 120000,
        product_name: "製品D",
      },
      {
        purchase_id: "PH005",
        customer_id: "CUST001",
        purchase_date: new Date("2024-04-05"),
        amount: 60000,
        product_name: "製品E",
      },
    ];

    const period_start = new Date("2024-01-01");
    const period_end = new Date("2024-03-31");

    const filtered_result = filterPurchaseHistoryByPeriod(
      purchase_history,
      period_start,
      period_end
    );

    expect(filtered_result).toHaveLength(3);

    expect(filtered_result[0]).toEqual({
      purchase_id: "PH002",
      customer_id: "CUST001",
      purchase_date: new Date("2024-01-10"),
      amount: 100000,
      product_name: "製品B",
    });

    expect(filtered_result[1]).toEqual({
      purchase_id: "PH003",
      customer_id: "CUST001",
      purchase_date: new Date("2024-02-20"),
      amount: 75000,
      product_name: "製品C",
    });

    expect(filtered_result[2]).toEqual({
      purchase_id: "PH004",
      customer_id: "CUST001",
      purchase_date: new Date("2024-03-30"),
      amount: 120000,
      product_name: "製品D",
    });

    const all_within_period = filtered_result.every(
      (record) =>
        record.purchase_date >= period_start &&
        record.purchase_date <= period_end
    );
    expect(all_within_period).toBe(true);

    const period_outside_items = purchase_history.filter(
      (record) =>
        record.purchase_date < period_start || record.purchase_date > period_end
    );
    const outside_in_filtered = filtered_result.some((item) =>
      period_outside_items.some(
        (outside) => outside.purchase_id === item.purchase_id
      )
    );
    expect(outside_in_filtered).toBe(false);

    expect(filtered_result.length).toBe(3);
  });
});