import { reconcileAmountsBetweenDealAndInvoice } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-756
  test('請求書明細が0件の請求書が存在する場合、金額照合はエラーになる', () => {
    const dealRecord = {
      dealId: 'DEAL-001',
      amount: 100000,
      status: '照合待ち',
    };

    const invoiceRecord = {
      invoiceId: 'INV-001',
      amount: 100000,
      status: '未照合',
      details: [],
    };

    expect(() =>
      reconcileAmountsBetweenDealAndInvoice(dealRecord, invoiceRecord)
    ).toThrow(/請求書明細/);
  });
});