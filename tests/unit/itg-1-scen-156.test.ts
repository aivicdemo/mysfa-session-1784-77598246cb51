import { aggregateMonthlySalesMetrics } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-156: [edge] 当月集計結果の月判定 - 月末日に登録された商談が当月集計に含まれる
  test('当月末日23時59分59秒に登録された商談が当月集計に含まれること', () => {
    const referenceDate = new Date('2024-04-01T00:00:00Z');
    const currentYear = referenceDate.getFullYear();
    const currentMonth = referenceDate.getMonth();

    // 当月末日23時59分59秒のタイムスタンプ
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
    const dealOnLastDayOfMonth = {
      dealId: 'deal-001',
      customerId: 'cust-001',
      amount: 1000000,
      status: '成約',
      registeredAt: lastDayOfMonth.toISOString(),
    };

    // 当月1日のタイムスタンプ
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1, 0, 0, 0, 0);
    const dealOnFirstDayOfMonth = {
      dealId: 'deal-002',
      customerId: 'cust-002',
      amount: 500000,
      status: '成約',
      registeredAt: firstDayOfMonth.toISOString(),
    };

    // 翌月1日のタイムスタンプ
    const firstDayOfNextMonth = new Date(currentYear, currentMonth + 1, 1, 0, 0, 0, 0);
    const dealOnFirstDayOfNextMonth = {
      dealId: 'deal-003',
      customerId: 'cust-003',
      amount: 2000000,
      status: '成約',
      registeredAt: firstDayOfNextMonth.toISOString(),
    };

    const allDeals = [
      dealOnFirstDayOfMonth,
      dealOnLastDayOfMonth,
      dealOnFirstDayOfNextMonth,
    ];

    const result = aggregateMonthlySalesMetrics(
      allDeals,
      referenceDate
    );

    expect(result.totalSalesAmount).toBe(1500000);
    expect(result.closedDealCount).toBe(2);
    expect(result.includedDealIds).toContain('deal-001');
    expect(result.includedDealIds).toContain('deal-002');
    expect(result.includedDealIds).not.toContain('deal-003');
  });
});