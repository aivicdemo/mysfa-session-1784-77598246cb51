import { validateInvoiceAmountConsistency } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 請求書承認検証機能', () => {
  // SCEN-117: [normal] 請求書承認検証機能 - 請求書の金額が商談の見積金額より少ないとき、金額整合性検証を成功させる
  test('金額が見積金額より少ないとき検証を成功させる', () => {
    const estimatedAmount = 100000;
    const invoiceAmount = 80000;
    const invoiceData = {
      invoiceAmount: invoiceAmount,
      estimatedAmount: estimatedAmount,
      customerId: 'CUST001',
      dealId: 'DEAL001',
    };

    const result = validateInvoiceAmountConsistency(invoiceData);

    expect(result.isValid).toBe(true);
    expect(result.status).toBe('検証OK');
    expect(result.errorMessage).toBeUndefined();
  });
});