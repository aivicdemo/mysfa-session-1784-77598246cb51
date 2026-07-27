import { generateInvoiceWithRoundingCalculation } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-591
  test('請求書自動生成機能 - 見積明細の単価が小数点を含む場合、丸め処理後の金額が正しく計算される', () => {
    const quoteLineItems = [
      {
        itemName: 'Product A',
        unitPrice: 123.456,
        quantity: 2,
      },
      {
        itemName: 'Product B',
        unitPrice: 78.9,
        quantity: 3,
      },
    ];

    const invoiceData = generateInvoiceWithRoundingCalculation(quoteLineItems);

    expect(invoiceData.lineItems).toHaveLength(2);

    expect(invoiceData.lineItems[0].itemName).toBe('Product A');
    expect(invoiceData.lineItems[0].roundedUnitPrice).toBe(123.46);
    expect(invoiceData.lineItems[0].quantity).toBe(2);
    expect(invoiceData.lineItems[0].lineTotal).toBe(246.92);

    expect(invoiceData.lineItems[1].itemName).toBe('Product B');
    expect(invoiceData.lineItems[1].roundedUnitPrice).toBe(78.90);
    expect(invoiceData.lineItems[1].quantity).toBe(3);
    expect(invoiceData.lineItems[1].lineTotal).toBe(236.70);

    expect(invoiceData.subtotal).toBe(483.62);
  });
});