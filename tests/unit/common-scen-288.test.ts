import { calculateROI } from '../../src/logic/common';

describe('共通', () => {
  // SCEN-288
  test('[error] 費用比較表・ROI算出機能 - 全費用が0の場合、ROI計算時にエラーまたは0%として処理される', () => {
    const expenseData = {
      initialCost: 0,
      operatingCost: 0,
      maintenanceCost: 0,
      totalBenefit: 1000,
    };

    // パターン1: エラーが発生する場合
    expect(() => calculateROI(expenseData)).toThrow(/費用/);
  });

  test('[success] 費用比較表・ROI算出機能 - 全費用が0の場合、0%として処理される', () => {
    const expenseData = {
      initialCost: 0,
      operatingCost: 0,
      maintenanceCost: 0,
      totalBenefit: 1000,
    };

    // パターン2: 0%として処理される場合
    const result = calculateROI(expenseData);
    expect(result).toBe(0);
  });

  test('[success] 費用比較表・ROI算出機能 - 正常な費用データでROIが計算される', () => {
    const expenseData = {
      initialCost: 100000,
      operatingCost: 50000,
      maintenanceCost: 10000,
      totalBenefit: 200000,
    };

    const result = calculateROI(expenseData);
    const totalExpense = 100000 + 50000 + 10000;
    const expectedROI = ((200000 - totalExpense) / totalExpense) * 100;

    expect(result).toBe(expectedROI);
  });

  test('[success] 費用比較表・ROI算出機能 - 費用が正の値の場合、ゼロ除算が発生しない', () => {
    const expenseData = {
      initialCost: 1,
      operatingCost: 0,
      maintenanceCost: 0,
      totalBenefit: 100,
    };

    const result = calculateROI(expenseData);
    expect(typeof result).toBe('number');
    expect(Number.isFinite(result)).toBe(true);
  });
});