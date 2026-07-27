import { aggregateMonthlySalesRevenue } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-126
  test('当月商談が0件のとき売上合計0円として集計される', () => {
    const targetMonth = '2024-01-01T00:00:00Z';
    const emptyDealList = [];

    const result = aggregateMonthlySalesRevenue(emptyDealList, targetMonth);

    expect(result.totalRevenue).toBe(0);
    expect(result.dealCount).toBe(0);
  });
});