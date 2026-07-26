import { calculateMonthlySalesMetrics } from '../../src/logic/it-1-3';

describe('月次営業成績自動計算機能', () => {
  // SCEN-117
  test('受注件数が提案数と等しい場合、進捗率が100%で計算される', () => {
    const input = {
      proposalCount: 10,
      orderCount: 10,
    };

    const result = calculateMonthlySalesMetrics(input);

    expect(result.progressRate).toBe(100);
    expect(result.orderCount).toBe(10);
    expect(result.proposalCount).toBe(10);
  });
});