import { searchCustomers } from "../../src/logic/it-1";

describe("顧客検索機能", () => {
  test("SCEN-354: 顧客名と顧客IDの両方で完全一致する顧客が存在する場合、同一の顧客レコードが1件抽出される", () => {
    const search_customer_id = "CUST-001";
    const search_customer_name = "株式会社テスト太郎";
    const search_customer_phone = "09012345678";
    const search_customer_email = "test@example.com";
    const search_customer_address = "東京都渋谷区";
    const search_customer_industry = "IT";

    const mock_database_customers = [
      {
        customer_id: "CUST-001",
        customer_name: "株式会社テスト太郎",
        customer_phone: "09012345678",
        customer_email: "test@example.com",
        customer_address: "東京都渋谷区",
        customer_industry: "IT",
      },
      {
        customer_id: "CUST-002",
        customer_name: "株式会社テスト花子",
        customer_phone: "09087654321",
        customer_email: "hanako@example.com",
        customer_address: "大阪府大阪市",
        customer_industry: "Finance",
      },
      {
        customer_id: "CUST-003",
        customer_name: "株式会社テスト太郎別店",
        customer_phone: "09011111111",
        customer_email: "branch@example.com",
        customer_address: "福岡県福岡市",
        customer_industry: "IT",
      },
    ];

    const result = searchCustomers(
      search_customer_id,
      search_customer_name,
      mock_database_customers
    );

    expect(result.length).toBe(1);
    expect(result[0].customer_id).toBe("CUST-001");
    expect(result[0].customer_name).toBe("株式会社テスト太郎");
    expect(result[0].customer_phone).toBe("09012345678");
    expect(result[0].customer_email).toBe("test@example.com");
    expect(result[0].customer_address).toBe("東京都渋谷区");
    expect(result[0].customer_industry).toBe("IT");
  });
});