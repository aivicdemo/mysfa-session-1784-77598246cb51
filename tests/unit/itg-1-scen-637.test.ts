import { describe, test, expect, beforeEach } from '@jest/globals';
import { reconcileInvoiceWithDeal } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-637
  test('同じ商談IDで複数の請求書が存在するとき、最新の請求書発行日で照合される', () => {
    const dealId = 'DEAL-001';
    const dealStatus = 'クローズ/成約';

    const invoices = [
      {
        invoiceId: 'INV-001',
        dealId: dealId,
        issuedDate: new Date('2024-01-10T00:00:00Z'),
        status: '発行済み',
      },
      {
        invoiceId: 'INV-002',
        dealId: dealId,
        issuedDate: new Date('2024-01-15T00:00:00Z'),
        status: '発行済み',
      },
      {
        invoiceId: 'INV-003',
        dealId: dealId,
        issuedDate: new Date('2024-01-20T00:00:00Z'),
        status: '発行済み',
      },
    ];

    const result = reconcileInvoiceWithDeal({
      dealId: dealId,
      dealStatus: dealStatus,
      invoices: invoices,
      reconciliationPeriodStart: new Date('2024-01-01T00:00:00Z'),
      reconciliationPeriodEnd: new Date('2024-12-31T23:59:59Z'),
    });

    expect(result.reconciliationStatus).toBe('一致');
    expect(result.selectedInvoiceId).toBe('INV-003');
    expect(result.selectedInvoiceIssuedDate).toEqual(new Date('2024-01-20T00:00:00Z'));
    expect(result.detailLog).toContain('複数請求書存在、最新（発行日2024-01-20）で照合実施');
    expect(result.dealIdMatched).toBe(true);
    expect(result.invoiceCount).toBe(3);
    expect(result.latestInvoiceStatus).toBe('発行済み');
  });
});