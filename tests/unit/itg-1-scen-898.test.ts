import { validateInvoiceDetail } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  // SCEN-898
  test("請求書承認検証機能 - 請求書明細の説明文が1文字のとき検証が合格する", () => {
    const invoiceDetail = {
      itemName: "商品A",
      description: "A",
      unitPrice: 1000,
      quantity: 2,
      amount: 2000,
      invoiceId: "INV-20240101-001",
    };

    const result = validateInvoiceDetail(invoiceDetail);

    expect(result).toBe(true);
  });
});