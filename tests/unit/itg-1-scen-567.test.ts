import { detectDelayedDeals } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-567
  test('商談ステータスと請求書の自動照合・遅延案件検出 - 請求予定日を超過した案件が1件のとき遅延案件リストに1件追加される', () => {
    const currentDate = new Date('2024-01-15T00:00:00Z');
    
    const deals = [
      {
        dealId: 'DEAL-001',
        customerName: 'テスト顧客A',
        invoiceExpectedDate: new Date('2024-01-10T00:00:00Z'),
        status: '受注',
        invoiceStatus: '未発行',
      },
    ];

    const delayedDeals = detectDelayedDeals(deals, currentDate);

    expect(delayedDeals).toHaveLength(1);
    expect(delayedDeals[0]).toEqual({
      dealId: 'DEAL-001',
      customerName: 'テスト顧客A',
      invoiceExpectedDate: new Date('2024-01-10T00:00:00Z'),
      daysDelayed: 5,
    });
  });
});