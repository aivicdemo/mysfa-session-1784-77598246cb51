import { validateInvoiceData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-836
  test('請求対象データ妥当性検証機能 - 請求明細の単価が負数のとき、該当データを不承認と判定する', () => {
    const invoiceLineItem = {
      invoiceId: 'INV-001',
      productName: 'サンプル商品',
      quantity: 5,
      unitPrice: -1000,
    };

    const result = validateInvoiceData(invoiceLineItem);

    expect(result.status).toBe('REJECTED');
    expect(result.errorCode).toBe('INVALID_UNIT_PRICE');
    expect(result.errorMessage).toBe(
      '請求明細の単価は正数である必要があります。負数は許可されていません。'
    );
    expect(result.isApproved).toBe(false);
  });
});