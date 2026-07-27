import { validateInvoiceDetailsAndCalculateTotal } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  // SCEN-864
  test("請求明細の単価に端数が含まれる場合、合計額が正確に計算される", () => {
    const invoiceDetails = [
      {
        detailId: "detail_001",
        quantity: 3,
        unitPrice: 10.5,
        description: "商品A",
      },
      {
        detailId: "detail_002",
        quantity: 2,
        unitPrice: 15.33,
        description: "商品B",
      },
      {
        detailId: "detail_003",
        quantity: 5,
        unitPrice: 8.67,
        description: "商品C",
      },
    ];

    const result = validateInvoiceDetailsAndCalculateTotal(invoiceDetails);

    expect(result.subtotalDetails).toEqual([
      {
        detailId: "detail_001",
        subtotal: 31.5,
      },
      {
        detailId: "detail_002",
        subtotal: 30.66,
      },
      {
        detailId: "detail_003",
        subtotal: 43.35,
      },
    ]);

    expect(result.totalAmount).toBe(105.51);
    expect(result.isValid).toBe(true);
  });
});