import { describe, test, expect } from '@jest/globals';
import { aggregateMonthlySalesRevenue } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-128
  test('当月売上集計機能 - 当月商談が複数件のとき売上合計がすべての商談金額の合算になる', () => {
    const dealCurrentMonth1 = {
      dealId: 'DEAL-001',
      dealAmount: 100000,
      dealStatus: '成約',
      dealDate: '2024-01-15'
    };

    const dealCurrentMonth2 = {
      dealId: 'DEAL-002',
      dealAmount: 250000,
      dealStatus: '成約',
      dealDate: '2024-01-20'
    };

    const dealCurrentMonth3 = {
      dealId: 'DEAL-003',
      dealAmount: 150000,
      dealStatus: '成約',
      dealDate: '2024-01-25'
    };

    const deals = [dealCurrentMonth1, dealCurrentMonth2, dealCurrentMonth3];
    const targetMonth = '2024-01';

    const result = aggregateMonthlySalesRevenue(deals, targetMonth);

    expect(result.monthlySalesRevenue).toBe(500000);
    expect(result.dealCount).toBe(3);
    expect(result.targetMonth).toBe('2024-01');
  });
});