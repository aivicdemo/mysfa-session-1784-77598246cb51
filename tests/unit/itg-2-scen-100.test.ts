import { validateInvoiceApproval } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 請求書承認検証機能', () => {
  // SCEN-100
  test('支払期限日が発行日より前のとき、検証エラーが発生する', () => {
    const invoiceData = {
      issuedDate: new Date('2024-01-15T00:00:00Z'),
      paymentDueDate: new Date('2024-01-10T00:00:00Z'),
      customerId: 'CUST001',
      amount: 100000,
      invoiceNumber: 'INV-2024-001',
    };

    expect(() => validateInvoiceApproval(invoiceData)).toThrow(/支払期限日/);
  });
});