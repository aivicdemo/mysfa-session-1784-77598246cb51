import { calculateMonthlyProgressRate } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-137
  test('当月進捗率計算機能 - 受注数0件、提案数1件のとき進捗率0%として計算される', () => {
    const closed_deals_count = 0;
    const proposed_deals_count = 1;

    const progress_rate = calculateMonthlyProgressRate(
      closed_deals_count,
      proposed_deals_count
    );

    expect(progress_rate).toBe(0);
  });
});