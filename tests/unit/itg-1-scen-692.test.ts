import { detectInvoiceDealMismatch } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-692
  test('月次決算期限3営業日前に照合開始時、商談データが存在しない請求書は遅延として検出される', () => {
    const monthlyDeadline = new Date('2025-01-31T00:00:00Z');
    const systemCurrentTime = new Date('2025-01-28T09:00:00Z');

    const deals = [
      {
        dealId: 'DEAL-001',
        status: '受注',
        amount: 500000,
        contractDate: new Date('2025-01-15T00:00:00Z'),
      },
    ];

    const invoices = [
      {
        invoiceId: 'INV-001',
        customerId: 'CUST-A',
        amount: 500000,
        issuedDate: new Date('2025-01-20T00:00:00Z'),
        relatedDealId: null,
      },
      {
        invoiceId: 'INV-002',
        customerId: 'CUST-B',
        amount: 300000,
        issuedDate: new Date('2025-01-22T00:00:00Z'),
        relatedDealId: 'DEAL-001',
      },
    ];

    const result = detectInvoiceDealMismatch(
      {
        monthlyDeadline,
        systemCurrentTime,
        deals,
        invoices,
      }
    );

    expect(result.delayedInvoices).toHaveLength(1);

    const delayedInvoice = result.delayedInvoices[0];
    expect(delayedInvoice.invoiceId).toBe('INV-001');
    expect(delayedInvoice.isDelayed).toBe(true);
    expect(delayedInvoice.mismatchReason).toBe('対応商談データが見つかりません');
    expect(delayedInvoice.detectedAt).toEqual(systemCurrentTime);

    const normalInvoice = result.normalInvoices[0];
    expect(normalInvoice.invoiceId).toBe('INV-002');
    expect(normalInvoice.isDelayed).toBe(false);
    expect(normalInvoice.mismatchReason).toBeNull();
  });
});