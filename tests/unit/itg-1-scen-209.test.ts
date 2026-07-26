import { validateBillingTargetData } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  test("SCEN-209: [error] 請求対象データ妥当性検証 - 金額フィールドが空の請求対象データが承認不可と判定される", () => {
    const billingTargetData = {
      billingDestination: "顧客A",
      subject: "商品B販売",
      quantity: 10,
      amount: "", // 金額フィールドを空のまま（未入力）
      unitPrice: 1000,
    };

    expect(() => validateBillingTargetData(billingTargetData)).toThrow(/金額/);
  });
});