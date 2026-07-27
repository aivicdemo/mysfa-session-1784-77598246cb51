import { calculateMonthlyProgressRate } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-140
  test('当月進捗率計算機能 - 受注数が提案数を上回るとき進捗率100%を超える値として計算される', () => {
    const proposalCount = 10;
    const closedCount = 15;

    const result = calculateMonthlyProgressRate({
      proposalCount,
      closedCount,
    });

    expect(result.progressRate).toBe(150);
  });
});