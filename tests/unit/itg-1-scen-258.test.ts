import { validateQuoteContent } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  // SCEN-258
  test("帳票内容検証機能 - 見積明細の単価が負の値の場合、警告を表示する", () => {
    const quoteData = {
      quoteId: "Q20240115001",
      customerId: "C001",
      customerName: "テスト顧客",
      quoteDate: "2024-01-15",
      items: [
        {
          itemId: "I001",
          productName: "ソフトウェアライセンス",
          quantity: 5,
          unitPrice: -1000,
        },
      ],
    };

    expect(() => {
      validateQuoteContent(quoteData);
    }).toThrow(/単価/);
  });
});