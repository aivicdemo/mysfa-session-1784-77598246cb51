import { validateInvoiceData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-809
  test('請求対象データ妥当性検証機能 - 請求明細の合計金額と請求金額が1円以上で異なるとき、該当データを不承認と判定する', () => {
    const invoiceLineItems = [
      { description: '商品A', quantity: 2, unitPrice: 3000 },
      { description: '商品B', quantity: 1, unitPrice: 4000 },
    ];
    const lineItemsTotalAmount = 2 * 3000 + 1 * 4000;
    const invoiceAmount = 10500;
    const amountDifference = Math.abs(lineItemsTotalAmount - invoiceAmount);

    const invoiceData = {
      invoiceId: 'INV-20240415-001',
      customerId: 'CUST-001',
      invoiceAmount: invoiceAmount,
      lineItems: invoiceLineItems,
      issueDate: '2024-04-15',
    };

    const validationResult = validateInvoiceData(invoiceData);

    expect(validationResult.isApproved).toBe(false);
    expect(validationResult.status).toBe('不承認');
    expect(validationResult.errorMessage).toMatch(/請求金額と明細合計が一致していません/);
    expect(validationResult.amountDifference).toBe(amountDifference);
  });
});