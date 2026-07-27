import { searchCustomerRecords } from "../../src/logic/it-1";

describe("顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能", () => {
  // SCEN-493
  test("営業者IDがnull・空のとき、検索結果に顧客が含まれない", () => {
    // 営業者IDがnullの場合
    const result_null = searchCustomerRecords({
      sales_person_id: null,
      search_query: "test_customer",
    });
    expect(result_null).toEqual([]);

    // 営業者IDが空文字列の場合
    const result_empty = searchCustomerRecords({
      sales_person_id: "",
      search_query: "test_customer",
    });
    expect(result_empty).toEqual([]);

    // 営業者IDが空白文字列の場合
    const result_whitespace = searchCustomerRecords({
      sales_person_id: "   ",
      search_query: "test_customer",
    });
    expect(result_whitespace).toEqual([]);
  });
});