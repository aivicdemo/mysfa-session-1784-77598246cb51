import { validateInvoiceDetails } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  // SCEN-259
  test("帳票内容検証機能 - 複数明細のうち1行だけ商品名が空の場合、その行についてのみ警告を表示する", () => {
    const invoiceDetails = [
      {
        lineNumber: 1,
        productName: "商品A",
        quantity: 10,
        unitPrice: 1000,
      },
      {
        lineNumber: 2,
        productName: "商品B",
        quantity: 5,
        unitPrice: 2000,
      },
      {
        lineNumber: 3,
        productName: "",
        quantity: 3,
        unitPrice: 1500,
      },
      {
        lineNumber: 4,
        productName: "商品D",
        quantity: 8,
        unitPrice: 2500,
      },
      {
        lineNumber: 5,
        productName: "商品E",
        quantity: 2,
        unitPrice: 3000,
      },
    ];

    const validationResult = validateInvoiceDetails(invoiceDetails);

    expect(validationResult.warnings).toHaveLength(1);
    expect(validationResult.warnings[0]).toMatch(/3行目/);
    expect(validationResult.warnings[0]).toMatch(/商品名/);
    expect(validationResult.lineNumbersWithWarnings).toEqual([3]);
  });
});