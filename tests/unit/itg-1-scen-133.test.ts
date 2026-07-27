import { aggregateMonthlySalesMetrics } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-133: [edge] 当月受注件数集計機能 - ステータスが受注の商談が1件のとき受注件数1として集計される
  test('当月の受注ステータス商談が1件のとき受注件数が1として集計される', () => {
    const currentDate = new Date('2024-04-15T10:00:00Z');
    const monthStart = new Date('2024-04-01T00:00:00Z');
    const monthEnd = new Date('2024-04-30T23:59:59Z');

    const dealRecords = [
      {
        dealId: 'DEAL-001',
        customerId: 'CUST-001',
        customerName: '株式会社テスト',
        status: '受注',
        amount: 500000,
        dealDate: new Date('2024-04-10T09:00:00Z'),
        productName: 'クラウドサービス年間契約',
      },
    ];

    const result = aggregateMonthlySalesMetrics({
      deals: dealRecords,
      targetMonth: {
        year: 2024,
        month: 4,
      },
    });

    expect(result.closedDealCount).toBe(1);
    expect(result.closedDeals).toHaveLength(1);
    expect(result.closedDeals[0].status).toBe('受注');
    expect(result.closedDeals[0].dealDate.getTime()).toBeGreaterThanOrEqual(monthStart.getTime());
    expect(result.closedDeals[0].dealDate.getTime()).toBeLessThanOrEqual(monthEnd.getTime());
  });
});