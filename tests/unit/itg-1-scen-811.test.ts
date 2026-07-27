import { validateInvoiceLineItems } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-811
  test('請求対象データ妥当性検証機能 - 請求明細が複数行のとき、全行の合計を請求金額と照合する', () => {
    const lineItems = [
      {
        lineNumber: 1,
        description: '商品A',
        amount: 10000,
      },
      {
        lineNumber: 2,
        description: '商品B',
        amount: 15000,
      },
      {
        lineNumber: 3,
        description: '商品C',
        amount: 25000,
      },
    ];

    const invoiceAmount = 50000;

    const result = validateInvoiceLineItems(lineItems, invoiceAmount);

    expect(result.isValid).toBe(true);
    expect(result.message).toMatch(/一致/);
    expect(result.calculatedTotal).toBe(50000);
  });
});