import { updateDealStatusToContracted } from "../../src/logic/it-1784969823049-2-1-1";

describe("商談レコードの進捗ステータスと提案内容の入力・保存機能", () => {
  // SCEN-210
  test("商談ステータスを成約に変更する際、必須項目チェックで顧客名が欠けている場合にステータス更新が拒否される", () => {
    const deal_record = {
      deal_id: "DEAL-001",
      customer_name: null,
      status: "進行中",
      amount: 500000,
      details: "商品A 5個",
    };

    expect(() =>
      updateDealStatusToContracted(deal_record)
    ).toThrow(/顧客名/);
  });
});