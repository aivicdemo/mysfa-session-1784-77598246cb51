import { aggregateMonthlyOrderCount } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-135
  test('当月受注件数集計機能 - ステータスが受注以外の商談は受注件数に含まれない', () => {
    const dealRecords = [
      {
        dealId: 'deal-a',
        status: '受注',
        amount: 1000000,
        createdDate: new Date('2024-01-01T00:00:00Z'),
      },
      {
        dealId: 'deal-b',
        status: '提案中',
        amount: 500000,
        createdDate: new Date('2024-01-05T00:00:00Z'),
      },
      {
        dealId: 'deal-c',
        status: '失注',
        amount: 300000,
        createdDate: new Date('2024-01-10T00:00:00Z'),
      },
      {
        dealId: 'deal-d',
        status: '受注',
        amount: 800000,
        createdDate: new Date('2024-01-15T00:00:00Z'),
      },
    ];

    const targetMonth = new Date('2024-01-01T00:00:00Z');

    const result = aggregateMonthlyOrderCount(dealRecords, targetMonth);

    expect(result.count).toBe(2);
    expect(result.totalAmount).toBe(1800000);
    expect(result.dealIds).toEqual(['deal-a', 'deal-d']);
  });
});