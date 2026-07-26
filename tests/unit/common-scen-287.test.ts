import { calculateROI } from '../../src/logic/common';

describe('共通', () => {
  // SCEN-287
  test('費用比較表・ROI算出機能 - 入力値にマイナス値が含まれる場合、エラーが返される', () => {
    const validInputs = {
      initialCost: 1000000,
      operatingCost: 50000,
      effectMeasurement: 200000,
    };

    const negativeInitialCost = {
      ...validInputs,
      initialCost: -1000000,
    };

    const negativeOperatingCost = {
      ...validInputs,
      operatingCost: -50000,
    };

    const negativeEffectMeasurement = {
      ...validInputs,
      effectMeasurement: -200000,
    };

    expect(() => calculateROI(negativeInitialCost)).toThrow(/初期費用/);
    expect(() => calculateROI(negativeOperatingCost)).toThrow(/運用費/);
    expect(() => calculateROI(negativeEffectMeasurement)).toThrow(/効果測定値/);
  });
});