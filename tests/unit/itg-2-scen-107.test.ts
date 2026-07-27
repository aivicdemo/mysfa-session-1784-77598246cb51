import { validateInvoiceLineAmounts } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 請求書承認検証機能', () => {
  // SCEN-107
  test('請求書明細の金額が単価×数量と一致しないとき、検証エラーが発生する', () => {
    const invoiceLines = [
      {
        lineNumber: 1,
        productName: '商品A',
        unitPrice: 100,
        quantity: 5,
        lineAmount: 600,
      },
    ];

    const expectedUnitPrice = 100;
    const expectedQuantity = 5;
    const expectedCorrectAmount = expectedUnitPrice * expectedQuantity;
    const inputLineAmount = 600;

    expect(() => validateInvoiceLineAmounts(invoiceLines)).toThrow(
      /明細金額が単価×数量と一致/
    );

    let errorThrown = false;
    let errorMessage = '';
    try {
      validateInvoiceLineAmounts(invoiceLines);
    } catch (error) {
      errorThrown = true;
      errorMessage = (error as Error).message;
    }

    expect(errorThrown).toBe(true);
    expect(errorMessage).toContain('明細金額が単価×数量と一致していません');
    expect(errorMessage).toContain('1');
    expect(errorMessage).toContain('商品A');
    expect(errorMessage).toContain('100');
    expect(errorMessage).toContain('5');
    expect(errorMessage).toContain('600');
    expect(errorMessage).toContain('500');
  });
});