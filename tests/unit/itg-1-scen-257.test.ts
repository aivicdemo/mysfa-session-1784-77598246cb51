import { validateQuoteContent } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  // SCEN-257
  test("帳票内容検証機能 - 見積明細の単価が空（未入力）の場合、警告を表示する", () => {
    const quoteData = {
      quoteId: "QT-2024-001",
      customerId: "CUST-100",
      customerName: "テスト顧客",
      dealAmount: 50000,
      items: [
        {
          itemId: "ITEM-001",
          productName: "サーバー保守",
          quantity: 1,
          unitPrice: null,
        },
      ],
    };

    expect(() => validateQuoteContent(quoteData)).toThrow(/単価/);
  });
});