import { validateQuoteContent } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け - 帳票内容検証機能", () => {
  // SCEN-266
  test("見積明細の単価が小数を含む場合、警告を表示する", () => {
    const quoteLineItem = {
      productName: "製品A",
      quantity: 10,
      unitPrice: 1500.50,
      taxRate: 0.1,
    };

    const result = validateQuoteContent(quoteLineItem);

    expect(result.status).toBe("warning");
    expect(result.warningMessage).toBe(
      "見積明細の単価に小数が含まれています。単価：1500.50 - システムの仕様確認をお願いします"
    );
  });
});