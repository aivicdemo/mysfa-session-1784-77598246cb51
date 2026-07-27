import { validateInvoiceApproval } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向け専用ポータル - 商談情報参照機能', () => {
  // SCEN-095
  test('請求書承認検証機能 - 請求書の顧客IDが空のとき、検証エラーが発生する', () => {
    const invoiceWithEmptyCustomerId = {
      invoiceId: 'INV-20240115-001',
      invoiceNumber: 'INV-2024-001',
      customerId: '',
      amount: 150000,
      invoiceDate: new Date('2024-01-15T00:00:00Z'),
      dueDate: new Date('2024-02-15T00:00:00Z'),
      status: 'pending',
    };

    const result = validateInvoiceApproval(invoiceWithEmptyCustomerId);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        field: 'customerId',
        message: expect.stringMatching(/顧客ID/),
      })
    );
    expect(result.statusChanged).toBe(false);
  });
});