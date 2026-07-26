import { calculateInitialConstructionCost } from '../../src/logic/it-1-br-1784969812908-1-1-1';

describe('Salesforce ライセンス利用状況の可視化機能', () => {
  // SCEN-031
  test('初期構築コスト算出機能 - 開発工数がゼロの場合に初期構築コストが0として算出される', () => {
    const input = {
      developmentManMonths: 0,
      unitPricePerManMonth: 800000,
      projectType: 'standard',
      infrastructureCost: 500000,
      toolingCost: 200000,
      trainingCost: 150000,
    };

    const result = calculateInitialConstructionCost(input);

    expect(result.initialConstructionCost).toBe(0);
    expect(typeof result.initialConstructionCost).toBe('number');
    expect(result.initialConstructionCost).toBeGreaterThanOrEqual(0);
  });
});