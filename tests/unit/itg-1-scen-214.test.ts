import { validateInvoiceApproval } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-214
  test('顧客情報が請求対象データと異なる場合、請求書承認が拒否される', () => {
    const invoiceData = {
      customerId: 'CUST-002',
      customerName: 'Customer B',
      amount: 100000,
      lineItems: [
        { productId: 'PROD-001', quantity: 1, unitPrice: 100000 }
      ]
    };

    const sourceData = {
      customerId: 'CUST-001',
      customerName: 'Customer A',
      amount: 100000,
      lineItems: [
        { productId: 'PROD-001', quantity: 1, unitPrice: 100000 }
      ]
    };

    expect(() => {
      validateInvoiceApproval(invoiceData, sourceData);
    }).toThrow(/顧客情報/);
  });
});