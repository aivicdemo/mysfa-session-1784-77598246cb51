import { validateInvoiceApproval } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向け専用ポータルでの商談情報参照機能', () => {
  // SCEN-113
  test('[error] 請求書承認検証機能 - 請求書が紐付く顧客情報が存在しないとき、検証エラーが発生する', () => {
    const invoiceId = 'INV-999999';
    const customerId = 'CUST-NONEXISTENT';

    const invoiceData = {
      invoiceId: invoiceId,
      customerId: customerId,
      amount: 100000,
      status: 'pending_approval'
    };

    const customerRepositoryStub = {
      findById: jest.fn().mockResolvedValue(null)
    };

    expect(() => validateInvoiceApproval(invoiceData, customerRepositoryStub)).toThrow(/顧客情報/);
  });
});