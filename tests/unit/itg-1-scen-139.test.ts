import { calculateMonthlyProgressRate } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-139
  test('当月進捗率計算機能 - 受注数1件、提案数2件のとき進捗率50%として計算される', () => {
    const monthlyData = {
      orderedCount: 1,
      proposalCount: 2,
    };

    const result = calculateMonthlyProgressRate(monthlyData);

    expect(result).toBe(0.5);
  });
});