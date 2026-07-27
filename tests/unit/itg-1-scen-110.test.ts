import { extractMonthlyCustomerData } from "../../src/logic/it-1";

describe("顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能", () => {
  // SCEN-110: [normal] 月次報告期限・データ抽出処理 - 抽出対象期間の前月に作成された顧客レコードが抽出対象に含まれない
  test("should exclude customers created in previous month from extraction results", () => {
    const currentDate = new Date("2024-02-15T00:00:00Z");
    const extractionStartDate = new Date("2024-02-01T00:00:00Z");
    const extractionEndDate = new Date("2024-02-29T23:59:59Z");

    const customer_created_in_january = {
      customer_id: "CUST-001",
      customer_name: "テスト顧客A",
      created_date: new Date("2024-01-15T00:00:00Z"),
    };

    const customer_created_in_february = {
      customer_id: "CUST-002",
      customer_name: "テスト顧客B",
      created_date: new Date("2024-02-10T00:00:00Z"),
    };

    const input_customers = [
      customer_created_in_january,
      customer_created_in_february,
    ];

    const extraction_period = {
      start_date: extractionStartDate,
      end_date: extractionEndDate,
    };

    const result = extractMonthlyCustomerData(input_customers, extraction_period);

    expect(result.length).toBe(1);
    expect(result[0].customer_id).toBe("CUST-002");
    expect(result[0].customer_name).toBe("テスト顧客B");
    expect(result[0].created_date).toEqual(
      new Date("2024-02-10T00:00:00Z")
    );
  });
});