import { reconcileDealsAndInvoices } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-521
  test('請求書金額が空白のとき、金額ズレの判定がエラーで終了する', () => {
    const dealRecord = {
      dealId: 'DEAL_20240415_001',
      dealName: 'テスト商談_金額ズレ検出',
      status: '受注確定',
      dealAmount: 500000,
      createdAt: new Date('2024-04-15T09:00:00Z'),
    };

    const invoiceRecord = {
      invoiceId: 'INV_20240415_001',
      dealId: 'DEAL_20240415_001',
      invoiceAmount: null,
      invoiceStatus: '未発行',
      issuedAt: null,
    };

    const reconciliationData = {
      deals: [dealRecord],
      invoices: [invoiceRecord],
      reconciliationPeriodStart: new Date('2024-04-01T00:00:00Z'),
      reconciliationPeriodEnd: new Date('2024-04-30T23:59:59Z'),
    };

    const result = expect(() => {
      reconcileDealsAndInvoices(reconciliationData);
    }).toThrow(/請求書金額/);

    expect(result).toBeDefined();
  });
});