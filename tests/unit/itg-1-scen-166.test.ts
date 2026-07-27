import { aggregateCustomerDealProgress } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-166
  test("顧客別商談進捗集計機能 - 初期接触ステータスの商談件数が1件のとき、その件数が1として集計される", () => {
    const customer_id = "CUST_001";
    const customer_name = "テスト顧客";

    const deals = [
      {
        deal_id: "DEAL_001",
        customer_id: customer_id,
        status: "初期接触",
        amount: 100000,
      },
    ];

    const result = aggregateCustomerDealProgress(deals);

    const targetResult = result.find(
      (r) => r.customer_id === customer_id
    );

    expect(targetResult).toBeDefined();
    expect(targetResult.customer_id).toBe(customer_id);
    expect(targetResult.progress_by_status).toBeDefined();

    const initial_contact_status = targetResult.progress_by_status.find(
      (p) => p.status === "初期接触"
    );

    expect(initial_contact_status).toBeDefined();
    expect(initial_contact_status.count).toBe(1);
  });
});