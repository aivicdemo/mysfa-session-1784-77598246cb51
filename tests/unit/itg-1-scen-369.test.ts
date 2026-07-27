import { searchCustomers } from "../../src/logic/it-1";

describe("顧客レコード画面の過去商談履歴・活動記録表示機能", () => {
  // SCEN-369: [edge] 顧客検索機能 - 検索対象の顧客レコードが業務上の最大件数に達した場合、全件が抽出される
  test("should extract all 10000 customer records when search condition is status=active", async () => {
    // Arrange: 顧客レコード10,000件のテストデータを生成
    const maxCustomerCount = 10000;
    const testCustomers = Array.from({ length: maxCustomerCount }, (_, index) => ({
      customer_id: `CUST-${String(index + 1).padStart(5, "0")}`,
      customer_name: `TestCustomer-${index + 1}`,
      address: `${index + 1} Test Street`,
      phone_number: `09012340000${String(index).padStart(3, "0")}`.slice(0, 11),
      email_address: `customer${index + 1}@example.com`,
      status: "active" as const,
    }));

    // Act: 検索条件を『ステータス = 有効』のみに設定して検索実行
    const search_condition = {
      status: "active" as const,
    };

    const search_result = await searchCustomers(testCustomers, search_condition);

    // Assert: 検索結果が10,000件全て抽出されることを検証
    expect(search_result.total_count).toBe(10000);
    expect(search_result.extracted_records.length).toBe(10000);

    // 最初のレコードが正確に抽出されていることを確認
    expect(search_result.extracted_records[0]).toEqual({
      customer_id: "CUST-00001",
      customer_name: "TestCustomer-1",
      address: "1 Test Street",
      phone_number: "09012340000000",
      email_address: "customer1@example.com",
      status: "active",
    });

    // 最後のレコードが正確に抽出されていることを確認
    expect(search_result.extracted_records[9999]).toEqual({
      customer_id: "CUST-10000",
      customer_name: "TestCustomer-10000",
      address: "10000 Test Street",
      phone_number: "09012349999",
      email_address: "customer10000@example.com",
      status: "active",
    });

    // タイムアウトやメモリ不足によるエラーが発生していないことを確認
    expect(search_result.error).toBeUndefined();
    expect(search_result.status).toBe("success");
  });
});