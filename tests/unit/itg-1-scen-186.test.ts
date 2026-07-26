import { detectAndResolveDelayedDeals } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-186
  test('遅延案件の顧客対応完了後、商談ステータスと請求書発行日が一致することを確認する', () => {
    const input = {
      dealId: 'DEAL-2024-00001',
      customerId: 'CUST-001',
      dealStatus: 'OVERDUE',
      dealAmount: 500000,
      expectedBillingDate: new Date('2024-01-15T00:00:00Z'),
      actualBillingDate: new Date('2024-02-10T00:00:00Z'),
      customerResolutionCompletedAt: new Date('2024-02-10T14:30:00Z'),
      billingInvoiceNumber: 'INV-2024-001',
      invoiceIssuedDate: new Date('2024-02-10T14:35:00Z'),
    };

    const result = detectAndResolveDelayedDeals(input);

    expect(result.dealId).toBe('DEAL-2024-00001');
    expect(result.dealStatus).toBe('COMPLETED');
    expect(result.dealStatusUpdatedAt).toEqual(new Date('2024-02-10T14:30:00Z'));
    expect(result.invoiceIssuedDate).toEqual(new Date('2024-02-10T14:35:00Z'));
    expect(result.statusBillingDateMismatch).toBe(false);
    expect(result.delayDetected).toBe(false);
    expect(result.syncStatus).toBe('SYNCHRONIZED');
    expect(result.discrepancyResolved).toBe(true);
    expect(result.customerAmount).toBe(500000);
    expect(result.billingAmount).toBe(500000);
    expect(result.isResolved).toBe(true);
    expect(result.resolutionTimestamp).toEqual(new Date('2024-02-10T14:35:00Z'));
  });
});