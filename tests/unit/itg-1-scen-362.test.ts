import { searchCustomersByName } from "../../src/logic/it-1";

describe("顧客レコード画面 - 過去の商談履歴・活動記録の時系列表示", () => {
  // SCEN-362
  test("顧客検索機能 - 部分一致検索で全角・半角を区別しない結果が返される", () => {
    const mockCustomers = [
      { customer_id: "C001", customer_name: "abc商事", region: "東京" },
      { customer_id: "C002", customer_name: "ａｂｃ工業", region: "大阪" },
      { customer_id: "C003", customer_name: "AbcTrade", region: "名古屋" },
      { customer_id: "C004", customer_name: "xyz株式会社", region: "福岡" },
      { customer_id: "C005", customer_name: "ａｂｃ商社", region: "京都" },
    ];

    const zenkakuResults = searchCustomersByName("ａｂｃ", mockCustomers);
    const hankakuResults = searchCustomersByName("abc", mockCustomers);

    expect(zenkakuResults.length).toBe(3);
    expect(hankakuResults.length).toBe(3);

    const zenkakuIds = zenkakuResults
      .map((c) => c.customer_id)
      .sort();
    const hankakuIds = hankakuResults
      .map((c) => c.customer_id)
      .sort();

    expect(zenkakuIds).toEqual(["C001", "C002", "C005"]);
    expect(hankakuIds).toEqual(["C001", "C002", "C005"]);

    expect(zenkakuResults).toEqual(hankakuResults);
  });
});