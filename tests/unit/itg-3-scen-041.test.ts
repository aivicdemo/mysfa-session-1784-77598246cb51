import { calculateMultiYearCostReduction } from '../../src/logic/it-1-br-1784969812908-1-1-1';

describe('複数年度コスト削減シミュレーション機能', () => {
  test('SCEN-041: ライセンス費用がゼロの場合にエラーが発生する', () => {
    const simulationInput = {
      salesforceLicenseCost: 0,
      developmentInitialCost: 5000000,
      annualMaintenanceCost: 1500000,
      simulationYears: 5
    };

    expect(() => {
      calculateMultiYearCostReduction(simulationInput);
    }).toThrow(/ライセンス費用/);
  });
});