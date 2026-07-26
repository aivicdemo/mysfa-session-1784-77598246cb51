import { updateDealStatusToContracted } from "../../src/logic/it-1784969823049-2-1-1";

describe("商談レコードの進捗ステータスと提案内容の入力・保存機能", () => {
  test("// SCEN-127: [error] 商談ステータス更新・請求データ紐付け機能 - 明細データが空の商談を『成約』に更新すると拒否される", () => {
    const dealRecord = {
      dealId: "DL-001",
      customerId: "CUST-001",
      dealAmount: 500000,
      dealStatus: "提案中",
      invoiceDetails: [],
    };

    expect(() => updateDealStatusToContracted(dealRecord)).toThrow(/明細/);
  });
});