import { extractCustomerDataForMonthlyReport } from "../../src/logic/it-1";

describe("顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能", () => {
  // SCEN-109: [edge] 月次報告期限・データ抽出処理 - 抽出対象期間の終了日に作成された顧客レコードが抽出対象に含まれる
  test("抽出対象期間の終了日時に作成された顧客は抽出結果に含まれ、終了日時より後に作成された顧客は除外されること", () => {
    const extraction_period_start = new Date("2024-01-01T00:00:00Z");
    const extraction_period_end = new Date("2024-01-31T23:59:59Z");

    const customer_A = {
      customer_id: "CUST001",
      customer_name: "TestCustomerA",
      created_at: new Date("2024-01-31T23:59:59Z"),
    };

    const customer_B = {
      customer_id: "CUST002",
      customer_name: "TestCustomerB",
      created_at: new Date("2024-02-01T00:00:00Z"),
    };

    const all_customers = [customer_A, customer_B];

    const extracted_customers = extractCustomerDataForMonthlyReport(
      all_customers,
      extraction_period_start,
      extraction_period_end
    );

    expect(extracted_customers).toHaveLength(1);
    expect(extracted_customers[0]).toEqual(
      expect.objectContaining({
        customer_id: "CUST001",
        customer_name: "TestCustomerA",
        created_at: new Date("2024-01-31T23:59:59Z"),
      })
    );
  });
});