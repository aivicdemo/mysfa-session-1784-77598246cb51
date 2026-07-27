import { reconcileSalesAndInvoices } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-980
  test('売上実績は正常で請求書が削除済みの場合、紐付け不整合として検出される', () => {
    const salesRecord = {
      salesId: 'SALES001',
      customerId: 'CUST001',
      amount: 100000,
      salesDate: '2024-01-15',
      status: '確定',
      isDeleted: false,
    };

    const invoiceRecord = {
      invoiceId: 'INV001',
      customerId: 'CUST001',
      billingAmount: 100000,
      billingDate: '2024-01-20',
      isDeleted: true,
    };

    const reconciliationResult = reconcileSalesAndInvoices([salesRecord], [invoiceRecord]);

    expect(reconciliationResult.discrepancies).toHaveLength(1);
    expect(reconciliationResult.discrepancies[0]).toEqual({
      salesId: 'SALES001',
      invoiceId: 'INV001',
      discrepancyReason: '削除フラグの不一致（売上実績:正常、請求書:削除済み）',
    });
  });
});