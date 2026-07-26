import { calculateMonthlyPerformanceMetrics } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-116
  test('月次営業成績自動計算機能 - 進捗率計算時に提案数が0の場合、ゼロ除算エラーが発生する', () => {
    const salesPerformanceData = {
      totalRevenue: 1500000,
      closedOrderCount: 3,
      proposalCount: 0,
      salespersonId: 'SP-001',
      month: '2024-04',
    };

    expect(() =>
      calculateMonthlyPerformanceMetrics(salesPerformanceData)
    ).toThrow(/ゼロ除算|提案数/i);
  });
});