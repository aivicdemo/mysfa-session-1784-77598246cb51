import { describe, test, expect, beforeEach } from '@jest/globals';
import { detectDelayedDeals } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-573
  test('商談ステータスが記録されていない案件は遅延案件判定時に例外が発生する', () => {
    const dealWithMissingStatus = {
      dealId: 'DEAL-001',
      customerId: 'CUST-123',
      dealStatus: null,
      invoiceIssuedDate: new Date('2024-01-15T00:00:00Z'),
      invoiceAmount: 150000,
      expectedInvoiceDate: new Date('2024-01-10T00:00:00Z'),
    };

    expect(() => detectDelayedDeals([dealWithMissingStatus])).toThrow(/商談ステータス/);
  });
});