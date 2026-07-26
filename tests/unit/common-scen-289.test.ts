import { calculateROI } from '../../src/logic/common';

describe('共通', () => {
  // SCEN-289
  test('費用比較表・ROI算出機能 - 年間保守運用コストがライセンス費用を上回る場合、正のROIが算出される', () => {
    const licenseFee = 1000000;
    const annualMaintenanceCost = 1500000;

    const result = calculateROI(annualMaintenanceCost, licenseFee);

    expect(result).toBe(50);
  });
});