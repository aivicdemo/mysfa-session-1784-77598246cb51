import { validateInvoiceApproval } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 商談情報参照機能', () => {
  // SCEN-092
  test('請求書に紐付く明細が0件のとき、検証エラーが発生する', () => {
    const invoiceId = 'INV-202401001';
    const invoiceData = {
      invoiceId: invoiceId,
      customerId: 'CUST-001',
      amount: 0,
      status: '承認待ち',
      createdAt: new Date('2024-01-15T10:00:00Z'),
      lineItems: [],
    };

    expect(() => validateInvoiceApproval(invoiceData)).toThrow(/請求書に紐付く明細が存在しません/);
  });
});