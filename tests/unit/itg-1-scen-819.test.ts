import { validateInvoiceTargetData } from "../../src/logic/it-1-2";

describe("商談ステータスと請求データの紐付け・可視化", () => {
  // SCEN-819: [normal] 請求対象データ妥当性検証機能 - 商談ステータスが成約済みのとき、請求対象と判定する
  test("商談ステータスが成約済みのとき請求対象と判定される", () => {
    const dealData = {
      dealId: "DEAL-001",
      customerId: "CUST-001",
      dealStatus: "成約済み",
      amount: 500000,
      dealDate: "2024-01-15",
      productName: "商品A",
      quantity: 2,
      unitPrice: 250000,
      totalAmount: 500000,
    };

    const result = validateInvoiceTargetData(dealData);

    expect(result.isInvoiceTarget).toBe(true);
  });
});