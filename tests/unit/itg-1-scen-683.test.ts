import { detectUnbilledAndDelayedDeals } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-683
  test('[normal] 月次決算期限3営業日前に照合開始時、未請求案件が1件の場合、その案件が検出結果に含まれる', () => {
    const currentDate = new Date('2024-04-15T09:00:00Z'); // 月次決算期限の3営業日前
    const monthlyDeadline = new Date('2024-04-18T23:59:59Z'); // 月次決算期限

    const deals = [
      {
        dealId: 'DEAL-001',
        customerId: 'CUST-A',
        customerName: 'テスト顧客A',
        status: '成約',
        amount: 100000,
        createdDate: new Date('2024-04-10T10:00:00Z'),
      },
    ];

    const invoices = [];

    const result = detectUnbilledAndDelayedDeals(
      deals,
      invoices,
      currentDate,
      monthlyDeadline
    );

    expect(result.unbilledDeals).toHaveLength(1);
    expect(result.unbilledDeals[0]).toEqual({
      dealId: 'DEAL-001',
      customerId: 'CUST-A',
      customerName: 'テスト顧客A',
      dealStatus: '成約',
      invoiceStatus: '未請求',
      amount: 100000,
      detectedAt: expect.any(Date),
    });
    expect(result.delayedDeals).toHaveLength(0);
  });
});