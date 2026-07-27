import { calculateMonthlyProgressRate } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-142
  test('当月進捗率計算機能 - 受注数3件、提案数7件のとき進捗率がおよそ42.857%として計算される', () => {
    const orders_count = 3;
    const proposals_count = 7;

    const progress_rate = calculateMonthlyProgressRate(orders_count, proposals_count);

    const expected_progress_rate = 42.857;
    expect(progress_rate).toBe(expected_progress_rate);
  });
});