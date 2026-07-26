import { generateInvoiceFromDeal } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  // SCEN-176
  test("商談レコードに金額情報が存在しない場合、請求書生成処理がエラーハンドリングされる", () => {
    const dealRecordWithoutAmount = {
      dealId: "DEAL-001",
      customerId: "CUST-001",
      customerName: "テスト顧客",
      customerAddress: "東京都渋谷区",
      dealStatus: "受注",
      dealAmount: null,
      dealDetails: [
        {
          productId: "PROD-001",
          productName: "商品A",
          quantity: 1,
          unitPrice: 100000,
        },
      ],
      dealCreatedDate: "2024-01-15T10:00:00Z",
    };

    expect(() => generateInvoiceFromDeal(dealRecordWithoutAmount)).toThrow(
      /金額/
    );
  });
});