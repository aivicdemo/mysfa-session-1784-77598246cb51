import { validateDealStatusTransition } from "../../src/logic/it-1784969823049-2-1-1";

describe("商談ステータス遷移検証機能", () => {
  // SCEN-729: [error] 商談ステータス遷移検証機能 - 遷移先ステータスが空の場合、検証は失敗する
  test("遷移先ステータスが空文字列の場合、バリデーションエラーをスローする", () => {
    const currentDeal = {
      id: "deal-001",
      customerId: "cust-001",
      currentStatus: "初期化",
      amount: 100000,
      description: "商談の説明",
    };

    const nextStatus = "";

    expect(() => {
      validateDealStatusTransition(currentDeal, nextStatus);
    }).toThrow(/遷移先ステータス/);

    expect(currentDeal.currentStatus).toBe("初期化");
  });
});