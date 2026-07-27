import { detectDelayedDeals } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-580
  test('請求書発行日が空文字列の場合、遅延案件判定の対象外となる', () => {
    const mockCurrentDate = new Date('2025-03-15T00:00:00Z');
    jest.useFakeTimers();
    jest.setSystemTime(mockCurrentDate);

    const deals = [
      {
        dealId: 'DEAL-001',
        status: '受注',
        contractAmount: 100000,
        invoiceIssuedDate: '',
      },
    ];

    const invoices = [
      {
        invoiceId: 'INV-001',
        dealId: 'DEAL-001',
        invoiceAmount: 100000,
        issuedDate: '',
        paymentDueDate: '2025-02-28',
      },
    ];

    const result = detectDelayedDeals(deals, invoices, mockCurrentDate);

    expect(result.delayedDeals).toEqual([]);
    expect(result.delayedDeals).not.toContainEqual(
      expect.objectContaining({ dealId: 'DEAL-001' })
    );

    jest.useRealTimers();
  });
});