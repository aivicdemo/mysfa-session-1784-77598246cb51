import { searchCustomer } from "../../src/logic/it-1";

describe("顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能", () => {
  // SCEN-144
  test("空文字列または空白文字列での検索が適切に処理される", () => {
    // 空文字列での検索
    expect(() => searchCustomer("")).toThrow(/検索条件/);

    // 空白文字列（スペースのみ）での検索
    expect(() => searchCustomer("   ")).toThrow(/検索条件/);

    // 正常な検索入力でエラーが発生しないことを確認
    const validSearchResult = searchCustomer("顧客A");
    expect(validSearchResult).toBeDefined();
    expect(Array.isArray(validSearchResult)).toBe(true);
  });
});