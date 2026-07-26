import { calculateInitialConstructionCost } from '../../src/logic/common';

describe('共通 - 初期構築コスト・年間保守運用コスト算出機能', () => {
  // SCEN-275
  test('開発規模・工数・人員配置から初期構築コストが正確に算出される', () => {
    const input = {
      developmentScale: 'large',
      requiredHours: 1000,
      staffAllocation: {
        engineers: 5,
        projectManagers: 1,
      },
      unitPrices: {
        engineerPerHour: 8000,
        pmPerHour: 12000,
      },
    };

    const result = calculateInitialConstructionCost(input);

    const engineerLaborCost = 1000 * 5 * 8000;
    const pmLaborCost = 1000 * 1 * 12000;
    const expectedTotalLaborCost = engineerLaborCost + pmLaborCost;
    const expectedTotalCost = expectedTotalLaborCost;

    expect(result.totalCost).toBe(62000000);
    expect(result.breakdown.engineerLaborCost).toBe(40000000);
    expect(result.breakdown.pmLaborCost).toBe(12000000);
    expect(result.breakdown.otherExpenses).toBe(10000000);
    expect(result.breakdown.totalLaborCost).toBe(52000000);
    expect(result.developmentScale).toBe('large');
    expect(result.staffAllocation.engineers).toBe(5);
    expect(result.staffAllocation.projectManagers).toBe(1);
    expect(Array.isArray(result.costDetails)).toBe(true);
    expect(result.costDetails.length).toBeGreaterThan(0);
  });
});