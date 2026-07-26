import { calculateAnnualMaintenanceCost } from '../../src/logic/common';

describe('共通', () => {
  // SCEN-276
  test('初期構築コスト・年間保守運用コスト算出機能 - 3年間の年間保守運用コストが人月単価と運用工数から正確に算出される', () => {
    const costPerPersonMonth = 1000000; // 100万円/人月
    const operatingManMonths = 12; // 12人月/年
    const yearsCount = 3; // 3年間

    const result = calculateAnnualMaintenanceCost({
      costPerPersonMonth,
      operatingManMonths,
      yearsCount,
    });

    // 1年目から3年目の各年度での期待値: 100万円 × 12人月 = 1200万円
    const expectedAnnualCost = 12000000;
    expect(result.year1).toBe(expectedAnnualCost);
    expect(result.year2).toBe(expectedAnnualCost);
    expect(result.year3).toBe(expectedAnnualCost);

    // 3年間の合計: (100万円 × 12人月) × 3 = 3600万円
    const expectedTotalCost = 36000000;
    expect(result.totalCost).toBe(expectedTotalCost);
  });
});