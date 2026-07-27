import { extractBillingData } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能 - 請求対象データ抽出", () => {
  // SCEN-770
  test("金額条件が上限値直上のとき、該当データが抽出されない", () => {
    const amount_limit = 100000;

    const billing_records = [
      {
        deal_id: "DEAL_001",
        customer_id: "CUST_001",
        amount: 99999,
        status: "received",
        created_at: "2024-01-15T09:00:00Z",
      },
      {
        deal_id: "DEAL_002",
        customer_id: "CUST_001",
        amount: 100000,
        status: "received",
        created_at: "2024-01-15T09:15:00Z",
      },
      {
        deal_id: "DEAL_003",
        customer_id: "CUST_001",
        amount: 100001,
        status: "received",
        created_at: "2024-01-15T09:30:00Z",
      },
      {
        deal_id: "DEAL_004",
        customer_id: "CUST_001",
        amount: 150000,
        status: "received",
        created_at: "2024-01-15T09:45:00Z",
      },
    ];

    const extraction_criteria = {
      amount_limit_max: amount_limit,
      filter_type: "lte",
    };

    const result = extractBillingData(billing_records, extraction_criteria);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      deal_id: "DEAL_001",
      customer_id: "CUST_001",
      amount: 99999,
      status: "received",
      created_at: "2024-01-15T09:00:00Z",
    });
    expect(result[1]).toEqual({
      deal_id: "DEAL_002",
      customer_id: "CUST_001",
      amount: 100000,
      status: "received",
      created_at: "2024-01-15T09:15:00Z",
    });
    expect(result.some((r) => r.deal_id === "DEAL_003")).toBe(false);
    expect(result.some((r) => r.deal_id === "DEAL_004")).toBe(false);
  });
});