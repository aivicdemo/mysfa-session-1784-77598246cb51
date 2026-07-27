import { searchCustomers } from "../../src/logic/it-1";

describe("顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能", () => {
  // SCEN-358
  test("顧客名と顧客IDの両方が空文字列で検索された場合、空の一覧が返される", () => {
    const customerName = "";
    const customerId = "";

    const result = searchCustomers({
      customerName,
      customerId,
    });

    expect(result.customers).toEqual([]);
    expect(result.totalCount).toBe(0);
    expect(result.hasResults).toBe(false);
  });
});