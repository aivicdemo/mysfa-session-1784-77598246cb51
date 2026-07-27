import { aggregateMonthlySalesResults } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-153
  test("当月集計結果の同一性 - 同じ当月商談データで2回集計を実行したとき同じ結果が得られる", () => {
    // テストデータの準備：当月の商談データ5件
    const testDeals = [
      {
        deal_id: "DEAL001",
        amount: 1000000,
        status: "受注",
        closed_date: "2024-04-15",
        customer_id: "CUST001",
        line_items: [
          { product_id: "PROD001", quantity: 10, unit_price: 100000 },
        ],
      },
      {
        deal_id: "DEAL002",
        amount: 500000,
        status: "受注",
        closed_date: "2024-04-20",
        customer_id: "CUST002",
        line_items: [
          { product_id: "PROD002", quantity: 5, unit_price: 100000 },
        ],
      },
      {
        deal_id: "DEAL003",
        amount: 750000,
        status: "受注",
        closed_date: "2024-04-10",
        customer_id: "CUST003",
        line_items: [
          { product_id: "PROD003", quantity: 15, unit_price: 50000 },
        ],
      },
      {
        deal_id: "DEAL004",
        amount: 200000,
        status: "提案中",
        closed_date: "2024-04-25",
        customer_id: "CUST004",
        line_items: [
          { product_id: "PROD004", quantity: 4, unit_price: 50000 },
        ],
      },
      {
        deal_id: "DEAL005",
        amount: 300000,
        status: "受注",
        closed_date: "2024-04-05",
        customer_id: "CUST005",
        line_items: [
          { product_id: "PROD005", quantity: 6, unit_price: 50000 },
        ],
      },
    ];

    const period_start = "2024-04-01";
    const period_end = "2024-04-30";

    // 第1回目の集計実行
    const first_aggregation_result = aggregateMonthlySalesResults(
      testDeals,
      period_start,
      period_end
    );

    // 第2回目の集計実行（同じデータ、同じ期間）
    const second_aggregation_result = aggregateMonthlySalesResults(
      testDeals,
      period_start,
      period_end
    );

    // 期待値の計算：
    // 受注ステータスのみカウント: DEAL001(1000000) + DEAL002(500000) + DEAL003(750000) + DEAL005(300000) = 2550000
    // 受注件数: 4件
    // 提案中は集計対象外
    // 平均金額（受注のみ）: 2550000 / 4 = 637500
    // 最高金額: 1000000
    // 最低金額: 300000
    const expected_total_amount = 2550000;
    const expected_deal_count = 4;
    const expected_average_amount = 637500;
    const expected_max_amount = 1000000;
    const expected_min_amount = 300000;

    // 第1回目と第2回目の結果がすべての項目で完全に一致することを検証
    expect(first_aggregation_result.total_amount).toBe(expected_total_amount);
    expect(first_aggregation_result.deal_count).toBe(expected_deal_count);
    expect(first_aggregation_result.average_amount).toBe(
      expected_average_amount
    );
    expect(first_aggregation_result.max_amount).toBe(expected_max_amount);
    expect(first_aggregation_result.min_amount).toBe(expected_min_amount);

    expect(second_aggregation_result.total_amount).toBe(
      first_aggregation_result.total_amount
    );
    expect(second_aggregation_result.deal_count).toBe(
      first_aggregation_result.deal_count
    );
    expect(second_aggregation_result.average_amount).toBe(
      first_aggregation_result.average_amount
    );
    expect(second_aggregation_result.max_amount).toBe(
      first_aggregation_result.max_amount
    );
    expect(second_aggregation_result.min_amount).toBe(
      first_aggregation_result.min_amount
    );

    // ステータス別内訳の検証（例：受注3件、提案中1件などの場合）
    expect(second_aggregation_result.status_breakdown).toEqual(
      first_aggregation_result.status_breakdown
    );
  });
});