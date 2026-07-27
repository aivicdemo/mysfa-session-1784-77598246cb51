import { describe, test, expect, beforeEach } from '@jest/globals';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-942
  test('請求日が無効な日付形式の場合、エラーが返される', async () => {
    const { reconcileSalesAndInvoiceData } = await import(
      '../../src/logic/it-1784969823049-1-1-1'
    );

    const invalidDateFormats = [
      '2024-13-45',
      '2024/2/30',
      'invalid-date',
      '',
      '2024-02-30',
      'null',
      undefined,
    ];

    for (const invalidDate of invalidDateFormats) {
      const reconciliationInput = {
        dealId: 'DEAL-001',
        dealStatus: '受注',
        invoiceDate: invalidDate,
        invoiceAmount: 100000,
        salesRecordDate: '2024-01-15',
        expectedBillingDate: '2024-01-20',
      };

      expect(() =>
        reconcileSalesAndInvoiceData(reconciliationInput)
      ).toThrow(/請求日/);
    }
  });
});