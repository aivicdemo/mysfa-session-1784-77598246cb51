import { validateInvoiceApproval } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-847
  test('請求書の合計金額が請求明細の合計と不一致のとき検証が不合格になる', () => {
    const invoiceHeaderTotalAmount = 150000;
    const invoiceLineItems = [
      { lineId: 1, amount: 100000 },
      { lineId: 2, amount: 40000 }
    ];
    const lineItemsTotal = 140000;
    const discrepancyAmount = 10000;

    const result = validateInvoiceApproval({
      invoiceId: 'INV-2024-001',
      headerTotalAmount: invoiceHeaderTotalAmount,
      lineItems: invoiceLineItems,
      approvalStatus: 'pending_approval'
    });

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toMatch(/請求書の合計金額/);
    expect(result.errorMessage).toMatch(/150000/);
    expect(result.errorMessage).toMatch(/140000/);
    expect(result.errorMessage).toMatch(/10000/);
    expect(result.approvalStatus).toBe('pending_approval');
  });
});