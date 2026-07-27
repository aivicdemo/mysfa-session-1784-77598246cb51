import { aggregateDealProgressByCustomer } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  test("SCEN-182: 顧客別商談進捗集計機能 - 初期接触ステータスの商談が複数件のとき、合計金額が正確に集計される", () => {
    const customer_id = "CUST_001";
    const deals = [
      {
        deal_id: "DEAL_001",
        customer_id: customer_id,
        status: "初期接触",
        amount: 500000,
      },
      {
        deal_id: "DEAL_002",
        customer_id: customer_id,
        status: "初期接触",
        amount: 750000,
      },
      {
        deal_id: "DEAL_003",
        customer_id: customer_id,
        status: "初期接触",
        amount: 1200000,
      },
    ];

    const result = aggregateDealProgressByCustomer(deals);

    expect(result).toEqual({
      customer_id: customer_id,
      progress_by_status: {
        初期接触: {
          deal_count: 3,
          total_amount: 2450000,
        },
        提案中: {
          deal_count: 0,
          total_amount: 0,
        },
        交渉中: {
          deal_count: 0,
          total_amount: 0,
        },
        受注: {
          deal_count: 0,
          total_amount: 0,
        },
        失注: {
          deal_count: 0,
          total_amount: 0,
        },
      },
    });
  });
});