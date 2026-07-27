import { detectDelayedInvoiceDeals } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-570
  test('請求予定日がちょうど本日と同じ日付の案件は遅延案件として判定されない', () => {
    const currentDate = new Date('2024-01-15T09:00:00Z');
    const dealRecord = {
      dealId: 'DEAL-001',
      customerName: 'テスト顧客A',
      invoiceDueDate: new Date('2024-01-15T00:00:00Z'),
      dealStatus: '成約',
      invoiceIssued: true,
    };

    const result = detectDelayedInvoiceDeals(
      [dealRecord],
      currentDate
    );

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dealId: 'DEAL-001',
          isDelayed: false,
          detectedAt: currentDate,
        }),
      ])
    );
    expect(result[0].isDelayed).toBe(false);
  });
});