import { reconcileInvoiceStatus } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-722
  test('[error] ステータス照合ロジック - 請求書発行日が空の場合、照合は実行されない', () => {
    const invoiceWithNullIssuedDate = {
      invoiceNumber: 'INV-2024-001',
      customerId: 'CUST-12345',
      amount: 100000,
      issuedDate: null,
      dealStatus: 'CLOSED_WON',
      expectedBillingDate: new Date('2024-02-15T00:00:00Z'),
    };

    expect(() => reconcileInvoiceStatus(invoiceWithNullIssuedDate)).toThrow(/請求書発行日/);
  });
});