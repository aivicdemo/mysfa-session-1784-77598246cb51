import { detectDelayedCases } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-576
  test("遅延案件が複数件含まれた入力で順序が異なる場合でも、遅延案件リスト内容は同じである", () => {
    // 準備: テストデータ - 異なる遅延日数を持つ商談3件
    const dealA = {
      deal_id: "DEAL_A",
      customer_name: "顧客A",
      status: "受注",
      amount: 1000000,
      billing_scheduled_date: "2024-01-10",
      billing_actual_date: "2024-01-20",
      days_overdue: 7,
    };

    const dealB = {
      deal_id: "DEAL_B",
      customer_name: "顧客B",
      status: "受注",
      amount: 500000,
      billing_scheduled_date: "2024-01-15",
      billing_actual_date: "2024-01-20",
      days_overdue: 3,
    };

    const dealC = {
      deal_id: "DEAL_C",
      customer_name: "顧客C",
      status: "完了",
      amount: 750000,
      billing_scheduled_date: "2024-01-08",
      billing_actual_date: "2024-01-20",
      days_overdue: 10,
    };

    // パターン1: A → B → C の順序
    const pattern1_input = [dealA, dealB, dealC];

    // パターン2: C → A → B の順序
    const pattern2_input = [dealC, dealA, dealB];

    // パターン1を遅延案件検出関数に渡す
    const pattern1_result = detectDelayedCases(pattern1_input);

    // パターン2を遅延案件検出関数に渡す
    const pattern2_result = detectDelayedCases(pattern2_input);

    // パターン1とパターン2から取得した遅延案件リストの商談IDセットを比較
    const pattern1_deal_ids = pattern1_result
      .map((deal) => deal.deal_id)
      .sort();
    const pattern2_deal_ids = pattern2_result
      .map((deal) => deal.deal_id)
      .sort();

    expect(pattern1_deal_ids).toEqual(pattern2_deal_ids);
    expect(pattern1_deal_ids).toEqual(["DEAL_A", "DEAL_B", "DEAL_C"]);

    // 各商談の遅延日数が同じであることを確認
    const pattern1_overdue_map = new Map(
      pattern1_result.map((deal) => [deal.deal_id, deal.days_overdue])
    );
    const pattern2_overdue_map = new Map(
      pattern2_result.map((deal) => [deal.deal_id, deal.days_overdue])
    );

    expect(pattern1_overdue_map.get("DEAL_A")).toBe(7);
    expect(pattern2_overdue_map.get("DEAL_A")).toBe(7);

    expect(pattern1_overdue_map.get("DEAL_B")).toBe(3);
    expect(pattern2_overdue_map.get("DEAL_B")).toBe(3);

    expect(pattern1_overdue_map.get("DEAL_C")).toBe(10);
    expect(pattern2_overdue_map.get("DEAL_C")).toBe(10);

    // パターン1とパターン2の全属性が一致することを確認
    const pattern1_sorted = pattern1_result.sort(
      (a, b) => a.deal_id.localeCompare(b.deal_id)
    );
    const pattern2_sorted = pattern2_result.sort(
      (a, b) => a.deal_id.localeCompare(b.deal_id)
    );

    expect(pattern1_sorted).toEqual(pattern2_sorted);
  });
});