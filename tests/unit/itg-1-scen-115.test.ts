import { calculateMonthlySalesMetrics } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-115
  test('当月に商談が0件の場合、売上合計0、受注件数0、進捗率0が返却される', () => {
    const deals = [];

    const result = calculateMonthlySalesMetrics(deals);

    expect(result.totalRevenue).toBe(0);
    expect(result.orderCount).toBe(0);
    expect(result.progressRate).toBe(0);
  });
});