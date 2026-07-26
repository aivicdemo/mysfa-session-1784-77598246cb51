import { aggregateLicenseCosts } from '../../src/logic/it-1-br-1784969812908-1-1-1';

describe('Salesforce ライセンス利用状況の可視化機能', () => {
  // SCEN-025
  test('contract information empty state aggregates license costs as 0', () => {
    const emptyContracts = [];

    const result = aggregateLicenseCosts(emptyContracts);

    expect(result).toEqual({
      totalCost: 0,
      contractCount: 0,
      editionBreakdown: [],
      annualCost: 0,
    });
    expect(typeof result.totalCost).toBe('number');
    expect(result.totalCost).toBe(0);
    expect(result.annualCost).toBe(0);
  });
});