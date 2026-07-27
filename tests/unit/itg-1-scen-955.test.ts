import { reconcileSalesAndInvoices } from '../../src/logic/it-1784969823049-1-1-1';

describe('売上実績・請求状況照合機能', () => {
  // SCEN-955
  test('売上実績の金額が請求書の合計金額より1円少ない場合、金額不整合として検出される', () => {
    const salesRecord = {
      id: 'SALES-001',
      amount: 99999,
      dealId: 'DEAL-001',
      recordedDate: new Date('2024-04-15T10:00:00Z'),
    };

    const invoiceRecord = {
      id: 'INV-001',
      totalAmount: 100000,
      dealId: 'DEAL-001',
      issuedDate: new Date('2024-04-15T11:00:00Z'),
    };

    const result = reconcileSalesAndInvoices(salesRecord, invoiceRecord);

    expect(result.status).toBe('不整合');
    expect(result.discrepancyAmount).toBe(1);
    expect(result.discrepancyType).toBe('金額差分');
    expect(result.detailMessage).toBe(
      '売上実績99999円と請求書合計100000円に1円の差分があります',
    );
    expect(result.expectedSalesAmount).toBe(99999);
    expect(result.actualInvoiceAmount).toBe(100000);
  });
});