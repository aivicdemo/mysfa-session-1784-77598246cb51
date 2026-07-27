import { validateInvoiceForApproval } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-901
  test('請求書の支払期限が本日のとき検証が合格する', () => {
    const today = new Date('2024-01-15T00:00:00Z');
    const invoiceData = {
      invoiceId: 'INV-2024-001',
      customerId: 'CUST-001',
      customerName: 'テスト顧客',
      invoiceAmount: 100000,
      invoiceDate: new Date('2024-01-15T00:00:00Z'),
      dueDate: today,
      invoiceItems: [
        {
          itemId: 'ITEM-001',
          description: '商品A',
          quantity: 1,
          unitPrice: 100000,
          lineTotal: 100000,
        },
      ],
      status: 'DRAFT',
      dealId: 'DEAL-001',
    };

    const result = validateInvoiceForApproval(invoiceData);

    expect(result.validationStatus).toBe('PASSED');
    expect(result.isApprovable).toBe(true);
    expect(result.errors).toEqual([]);
  });
});