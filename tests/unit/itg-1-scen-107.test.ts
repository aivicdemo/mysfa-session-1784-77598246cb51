import { extractCustomerRecordsByPeriod } from "../../src/logic/it-1";

describe("顧客レコード画面の過去商談履歴・活動記録の時系列表示機能", () => {
  // SCEN-107
  test("月次報告期限・データ抽出処理 - 抽出対象期間内に作成された顧客レコード複数件の場合、全件が返される", () => {
    const extraction_period_start = new Date("2024-01-01T00:00:00Z");
    const extraction_period_end = new Date("2024-01-31T23:59:59Z");

    const customer_record_1 = {
      customer_id: "CUST001",
      customer_name: "ABC商事",
      created_at: new Date("2024-01-15T10:30:00Z"),
    };

    const customer_record_2 = {
      customer_id: "CUST002",
      customer_name: "XYZ工業",
      created_at: new Date("2024-01-20T14:45:30Z"),
    };

    const customer_record_3 = {
      customer_id: "CUST003",
      customer_name: "123商社",
      created_at: new Date("2024-01-25T09:15:00Z"),
    };

    const customer_record_out_of_period = {
      customer_id: "CUST999",
      customer_name: "OUT商事",
      created_at: new Date("2024-02-05T11:00:00Z"),
    };

    const all_records = [
      customer_record_1,
      customer_record_2,
      customer_record_3,
      customer_record_out_of_period,
    ];

    const extracted_records = extractCustomerRecordsByPeriod(
      all_records,
      extraction_period_start,
      extraction_period_end
    );

    expect(extracted_records.length).toBe(3);

    const extracted_ids = extracted_records.map((record) => record.customer_id);
    const extracted_names = extracted_records.map(
      (record) => record.customer_name
    );

    expect(extracted_ids).toContain("CUST001");
    expect(extracted_ids).toContain("CUST002");
    expect(extracted_ids).toContain("CUST003");
    expect(extracted_ids).not.toContain("CUST999");

    expect(extracted_names).toContain("ABC商事");
    expect(extracted_names).toContain("XYZ工業");
    expect(extracted_names).toContain("123商社");
    expect(extracted_names).not.toContain("OUT商事");

    const expected_extracted = [
      customer_record_1,
      customer_record_2,
      customer_record_3,
    ];

    expect(extracted_records).toEqual(
      expect.arrayContaining(expected_extracted)
    );
  });
});