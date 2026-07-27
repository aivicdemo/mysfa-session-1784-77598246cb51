import { validateInvoiceApproval } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-886
  test('請求書承認検証機能 - 複数割引が適用された場合、合計が正確に計算される', () => {
    const invoiceData = {
      items: [
        { name: 'Product A', unitPrice: 1000, quantity: 10 },
        { name: 'Product B', unitPrice: 2000, quantity: 5 },
      ],
      discounts: [
        { type: 'fixed', amount: 2000 },
        { type: 'percentage', rate: 10 },
        { type: 'earlyPayment', rate: 5 },
      ],
    };

    const result = validateInvoiceApproval(invoiceData);

    const subtotal = 20000;
    const discount1 = 2000;
    const afterDiscount1 = subtotal - discount1;
    const discount2 = afterDiscount1 * 0.1;
    const afterDiscount2 = afterDiscount1 - discount2;
    const discount3 = afterDiscount2 * 0.05;
    const finalTotal = afterDiscount2 - discount3;

    expect(result.subtotal).toBe(20000);
    expect(result.discounts[0].amount).toBe(2000);
    expect(result.discounts[1].amount).toBe(1800);
    expect(result.discounts[2].amount).toBe(810);
    expect(result.finalTotal).toBe(15390);
  });
});