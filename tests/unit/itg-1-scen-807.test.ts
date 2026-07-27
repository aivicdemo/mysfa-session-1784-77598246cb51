import { validateInvoiceAmountMatch } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-807
  test('請求対象データ妥当性検証機能 - 請求明細の合計金額と請求金額が一致するとき、該当項目を検証OK と判定する', () => {
    const invoiceId = 'INV-20250115-001';
    const invoiceAmount = 150000;
    const invoiceLineItems = [
      { lineItemId: 'LINE-001', productName: '商品A', amount: 30000 },
      { lineItemId: 'LINE-002', productName: '商品B', amount: 70000 },
      { lineItemId: 'LINE-003', productName: '商品C', amount: 50000 },
    ];

    const lineTotalAmount = invoiceLineItems.reduce((sum, item) => sum + item.amount, 0);
    expect(lineTotalAmount).toBe(150000);

    const validationResult = validateInvoiceAmountMatch(invoiceId, invoiceAmount, invoiceLineItems);

    expect(validationResult).toEqual({
      valid: true,
      itemCode: 'invoiceAmountMatch',
      status: 'OK',
      message: '請求明細の合計金額と請求金額が一致しています',
    });
  });
});