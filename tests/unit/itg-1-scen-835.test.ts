import { validateInvoiceLineItems } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  // SCEN-835
  test("請求明細の単価が0のとき、該当データを不承認と判定する", () => {
    const invoiceLineItem = {
      product_id: "PROD-001",
      quantity: 5,
      unit_price: 0,
      tax_rate: 0.1,
    };

    const result = validateInvoiceLineItems([invoiceLineItem]);

    expect(result.is_approved).toBe(false);
    expect(result.error_message).toMatch(/単価/);
    expect(result.excluded_items).toContainEqual(invoiceLineItem);
  });
});