import {
  fetchCustomerTransactionHistory,
} from "../../src/logic/it-1";

describe("顧客レコード画面の商談履歴・活動記録表示", () => {
  test("SCEN-453: 課題解決状況が逆時系列（降順）で並んでいる場合、その順序で返される", () => {
    const customer_id = "CUST-001";

    const mock_transaction_records = [
      {
        id: "ISSUE-RESOLVE-001",
        customer_id: customer_id,
        resolved_date: new Date("2024-01-05T10:00:00Z"),
        status: "resolved",
        description: "初期問題解決",
      },
      {
        id: "ISSUE-RESOLVE-002",
        customer_id: customer_id,
        resolved_date: new Date("2024-01-10T14:30:00Z"),
        status: "resolved",
        description: "中期問題解決",
      },
      {
        id: "ISSUE-RESOLVE-003",
        customer_id: customer_id,
        resolved_date: new Date("2024-01-15T09:15:00Z"),
        status: "resolved",
        description: "最新問題解決",
      },
    ];

    const result = fetchCustomerTransactionHistory(
      customer_id,
      mock_transaction_records
    );

    expect(result).toHaveLength(3);

    expect(result[0]).toEqual(mock_transaction_records[2]);
    expect(result[1]).toEqual(mock_transaction_records[1]);
    expect(result[2]).toEqual(mock_transaction_records[0]);

    expect(result[0].resolved_date).toEqual(new Date("2024-01-15T09:15:00Z"));
    expect(result[1].resolved_date).toEqual(new Date("2024-01-10T14:30:00Z"));
    expect(result[2].resolved_date).toEqual(new Date("2024-01-05T10:00:00Z"));

    expect(result[0].resolved_date.getTime()).toBeGreaterThan(
      result[1].resolved_date.getTime()
    );
    expect(result[1].resolved_date.getTime()).toBeGreaterThan(
      result[2].resolved_date.getTime()
    );
  });
});