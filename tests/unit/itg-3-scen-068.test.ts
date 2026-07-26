import { calculateROIComparison } from '../../src/logic/it-1-br-1784969812908-1-1-1';

describe('Salesforce ライセンス利用状況の可視化機能 - ROI試算・コスト比較分析', () => {
  // SCEN-068: [edge] ROI試算・コスト比較分析機能 - ROI試算期間が0年または負の値の場合、エラーを返す
  test('ROI試算期間に0年以下の値が入力された場合、エラーメッセージが表示され処理が中断されること', () => {
    const baseInput = {
      salesforceLicenseCostAnnual: 1200000,
      userCount: 50,
      developmentInitialCost: 5000000,
      maintenanceAnnualCost: 800000,
    };

    // ケース1: 試算期間が0年の場合
    expect(() =>
      calculateROIComparison({
        ...baseInput,
        roiCalculationPeriodYears: 0,
      })
    ).toThrow(/試算期間/);

    // ケース2: 試算期間が-1年の場合
    expect(() =>
      calculateROIComparison({
        ...baseInput,
        roiCalculationPeriodYears: -1,
      })
    ).toThrow(/試算期間/);

    // ケース3: 試算期間が-5年の場合
    expect(() =>
      calculateROIComparison({
        ...baseInput,
        roiCalculationPeriodYears: -5,
      })
    ).toThrow(/試算期間/);
  });
});