import { searchCustomers } from "../../src/logic/it-1";

describe("顧客レコード画面 - 過去商談履歴・活動記録の時系列表示", () => {
  // SCEN-143
  test("存在しない顧客名で検索した場合に空の検索結果が返される", () => {
    const nonExistentCustomerName = "ZZZZZZZZZ";
    const searchInput = {
      searchQuery: nonExistentCustomerName,
      searchType: "customerName" as const,
    };

    const result = searchCustomers(searchInput);

    expect(result.customers).toEqual([]);
    expect(result.totalCount).toBe(0);
    expect(result.message).toBe("該当する顧客が見つかりません");
    expect(result.isError).toBe(false);
  });
});