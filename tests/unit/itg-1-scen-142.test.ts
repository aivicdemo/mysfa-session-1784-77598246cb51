import { searchCustomersByIdPartialMatch } from "../../src/logic/it-1";

describe("顧客検索機能", () => {
  test("SCEN-142: 顧客IDの部分一致で複数の顧客レコードが抽出される", () => {
    const search_input_id = "CUST-12";

    const mock_customers = [
      {
        customer_id: "CUST-121",
        customer_name: "株式会社A",
        address: "東京都渋谷区",
      },
      {
        customer_id: "CUST-122",
        customer_name: "株式会社B",
        address: "東京都新宿区",
      },
      {
        customer_id: "CUST-123",
        customer_name: "株式会社C",
        address: "神奈川県横浜市",
      },
      {
        customer_id: "CUST-234",
        customer_name: "株式会社D",
        address: "埼玉県さいたま市",
      },
    ];

    const result = searchCustomersByIdPartialMatch(search_input_id, mock_customers);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      customer_id: "CUST-121",
      customer_name: "株式会社A",
      address: "東京都渋谷区",
    });
    expect(result[1]).toEqual({
      customer_id: "CUST-122",
      customer_name: "株式会社B",
      address: "東京都新宿区",
    });
    expect(result[2]).toEqual({
      customer_id: "CUST-123",
      customer_name: "株式会社C",
      address: "神奈川県横浜市",
    });

    expect(result.every((r) => r.customer_id.includes(search_input_id))).toBe(
      true
    );
  });
});