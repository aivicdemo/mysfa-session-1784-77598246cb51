import { detectDelayedDeals } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書の自動照合・ズレ検出機能', () => {
  // SCEN-579
  test('商談ステータスが空文字列の場合、遅延案件判定の対象外となる', () => {
    const mockDeals = [
      {
        dealId: 'DEAL-001',
        customerName: 'テスト顧客A',
        dealStatus: '',
        contractedDate: '2024-01-15',
        createdDate: '2023-12-01',
      },
    ];

    const mockInvoices = [
      {
        invoiceId: 'INV-001',
        dealId: 'DEAL-001',
        invoiceStatus: '未払い',
        issuedDate: '2024-02-01',
        paymentDueDate: '2024-02-15',
      },
    ];

    const currentDate = new Date('2024-03-01T00:00:00Z');

    const result = detectDelayedDeals(mockDeals, mockInvoices, currentDate);

    expect(result.delayedDeals).toEqual([]);
    expect(result.delayedDeals.some((deal) => deal.dealId === 'DEAL-001')).toBe(
      false
    );
  });
});