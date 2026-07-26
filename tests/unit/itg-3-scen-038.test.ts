import { calculateROI } from '../../src/logic/it-1-br-1784969812908-1-1-1';

describe('Salesforce ライセンス利用状況の可視化機能', () => {
  // SCEN-038
  test('コスト比較表生成機能 - 分母がゼロの場合ROI計算でエラーが発生する', () => {
    const initialInvestment = 0;
    const annualOperatingCost = 1500;
    const salesforceLicenseCost = 2000;

    expect(() => {
      calculateROI({
        initialInvestment,
        annualOperatingCost,
        salesforceLicenseCost,
      });
    }).toThrow(/初期投資額/);
  });
});