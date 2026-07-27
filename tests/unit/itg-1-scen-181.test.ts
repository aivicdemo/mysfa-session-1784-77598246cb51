import { aggregateDealProgressByCustomer } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-181
  test("顧客別商談進捗集計機能 - 初期接触ステータスの商談が1件で金額が0円を超えるとき、その金額が正確に集計される", () => {
    const testDeals = [
      {
        customerId: "CUST001",
        dealId: "DEAL001",
        status: "初期接触",
        amount: 150000,
      },
    ];

    const result = aggregateDealProgressByCustomer(testDeals);

    const customerResult = result.find((r) => r.customerId === "CUST001");
    expect(customerResult).toBeDefined();

    const initialContactData = customerResult?.progressByStatus.find(
      (p) => p.status === "初期接触"
    );
    expect(initialContactData).toBeDefined();
    expect(initialContactData?.totalAmount).toBe(150000);
    expect(initialContactData?.dealCount).toBe(1);
  });
});