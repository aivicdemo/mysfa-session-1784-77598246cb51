import { calculateMonthlyProgressRate } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-138
  test('当月進捗率計算機能 - 受注数1件、提案数1件のとき進捗率100%として計算される', () => {
    const targetOrderCount = 1;
    const targetProposalCount = 1;
    const actualOrderCount = 1;
    const actualProposalCount = 1;

    const result = calculateMonthlyProgressRate({
      targetOrderCount,
      targetProposalCount,
      actualOrderCount,
      actualProposalCount,
    });

    expect(result.progressRate).toBe(100);
  });
});