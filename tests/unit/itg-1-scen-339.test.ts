import { generateMonthlyRevenueReport } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-339
  test('商談ステータスが空（null）のレコードが含まれるとき、集計対象から除外される', () => {
    const deals = [
      {
        id: 'deal-a',
        status: '提案中',
        amount: 1000000,
        customerId: 'cust-001',
        createdAt: new Date('2024-01-15T09:00:00Z'),
      },
      {
        id: 'deal-b',
        status: null,
        amount: 500000,
        customerId: 'cust-002',
        createdAt: new Date('2024-01-20T10:30:00Z'),
      },
      {
        id: 'deal-c',
        status: '受注',
        amount: 2000000,
        customerId: 'cust-003',
        createdAt: new Date('2024-01-25T14:15:00Z'),
      },
    ];

    const targetMonth = '2024-01';

    const report = generateMonthlyRevenueReport(deals, targetMonth);

    expect(report.totalAmount).toBe(3000000);
    expect(report.includedDealCount).toBe(2);
    expect(report.excludedDealCount).toBe(1);
    expect(report.deals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'deal-a',
          status: '提案中',
          amount: 1000000,
        }),
        expect.objectContaining({
          id: 'deal-c',
          status: '受注',
          amount: 2000000,
        }),
      ])
    );
    expect(report.deals).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'deal-b',
        }),
      ])
    );
  });
});