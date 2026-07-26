import { classifyDealsByCustomerProgress } from "../../src/logic/it-1";

describe("顧客別商談進捗分類機能", () => {
  test("SCEN-120: 商談データが存在しない顧客の場合、空の分類結果が返却される", () => {
    // 商談データが存在しない顧客を検索・選択
    const customerId = "CUST-99999";
    const customerName = "データなし顧客";
    
    // 商談レコードが空の状態
    const deals = [];
    
    // 分類結果を表示
    const result = classifyDealsByCustomerProgress({
      customerId,
      customerName,
      deals
    });
    
    // 返却される結果の内容を確認
    // 空の分類結果が返却される
    expect(result).toEqual({
      customerId,
      customerName,
      initialContact: { count: 0, amount: 0, deals: [] },
      proposing: { count: 0, amount: 0, deals: [] },
      negotiating: { count: 0, amount: 0, deals: [] },
      contracted: { count: 0, amount: 0, deals: [] },
      lost: { count: 0, amount: 0, deals: [] }
    });
    
    // エラーメッセージは表示されないこと
    expect(result).not.toHaveProperty("error");
  });
});