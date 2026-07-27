import { validateInvoiceLineItem } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向け専用ポータルでの商談情報参照機能', () => {
  // SCEN-105
  test('[error] 請求書承認検証機能 - 請求書明細の単価が0のとき、検証エラーが発生する', () => {
    const invoiceLineItem = {
      itemName: 'テスト商品',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
    };

    expect(() => validateInvoiceLineItem(invoiceLineItem)).toThrow(
      /単価/
    );
  });
});