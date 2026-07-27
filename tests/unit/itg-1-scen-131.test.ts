import { aggregateMonthlySalesRevenue } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-131: [normal] 当月売上集計機能 - 複数の重複する商談金額が含まれるとき正確に合算される
  test("should accurately sum multiple deals with duplicate amounts in monthly sales aggregation", () => {
    const deal_a = {
      id: "deal_001",
      customer_id: "cust_001",
      amount: 150000,
      status: "成約",
      deal_date: new Date("2024-01-15T10:00:00Z"),
    };

    const deal_b = {
      id: "deal_002",
      customer_id: "cust_001",
      amount: 150000,
      status: "成約",
      deal_date: new Date("2024-01-20T14:30:00Z"),
    };

    const deal_c = {
      id: "deal_003",
      customer_id: "cust_001",
      amount: 200000,
      status: "成約",
      deal_date: new Date("2024-01-25T09:15:00Z"),
    };

    const deals = [deal_a, deal_b, deal_c];

    const aggregation_start_date = new Date("2024-01-01T00:00:00Z");
    const aggregation_end_date = new Date("2024-01-31T23:59:59Z");

    const result = aggregateMonthlySalesRevenue(
      deals,
      aggregation_start_date,
      aggregation_end_date
    );

    expect(result.total_revenue).toBe(500000);
    expect(result.contracted_deal_count).toBe(3);
    expect(result.aggregation_period_start).toEqual(aggregation_start_date);
    expect(result.aggregation_period_end).toEqual(aggregation_end_date);
  });
});