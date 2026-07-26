import { searchCustomerByName } from "../../src/logic/it-1";

describe("顧客レコード画面の過去商談履歴・活動記録の表示機能", () => {
  // SCEN-141
  test("顧客検索機能 - 顧客名の完全一致で検索結果が正確に抽出される", () => {
    const customers = [
      {
        customer_id: "C001",
        customer_name: "山田太郎",
        contact_phone: "090-1234-5678",
        contact_email: "yamada.taro@example.com",
        company_name: "山田商事",
      },
      {
        customer_id: "C002",
        customer_name: "山田花子",
        contact_phone: "090-2345-6789",
        contact_email: "yamada.hanako@example.com",
        company_name: "山田商事",
      },
      {
        customer_id: "C003",
        customer_name: "田中太郎",
        contact_phone: "090-3456-7890",
        contact_email: "tanaka.taro@example.com",
        company_name: "田中工業",
      },
      {
        customer_id: "C004",
        customer_name: "山田太郎",
        contact_phone: "090-4567-8901",
        contact_email: "yamada.taro.2@example.com",
        company_name: "山田物産",
      },
    ];

    const search_keyword = "山田太郎";
    const result = searchCustomerByName(search_keyword, customers);

    expect(result).toEqual([
      {
        customer_id: "C001",
        customer_name: "山田太郎",
        contact_phone: "090-1234-5678",
        contact_email: "yamada.taro@example.com",
        company_name: "山田商事",
      },
      {
        customer_id: "C004",
        customer_name: "山田太郎",
        contact_phone: "090-4567-8901",
        contact_email: "yamada.taro.2@example.com",
        company_name: "山田物産",
      },
    ]);

    expect(result.length).toBe(2);
    expect(result[0].customer_name).toBe("山田太郎");
    expect(result[1].customer_name).toBe("山田太郎");
    expect(result.every((c) => c.customer_name === search_keyword)).toBe(true);

    const exact_match_only = result.filter(
      (c) => c.customer_name !== search_keyword
    );
    expect(exact_match_only.length).toBe(0);
  });
});