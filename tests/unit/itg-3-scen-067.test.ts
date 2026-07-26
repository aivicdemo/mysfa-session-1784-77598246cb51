import { calculateROIComparison } from '../../src/logic/it-1-br-1784969812908-1-1-1';

describe('Salesforce ライセンス利用状況の可視化機能 - ROI試算・コスト比較分析', () => {
  test('SCEN-067: 比較対象データが不完全（費用項目の欠落）な場合、エラーを返して計算を中止する', () => {
    // パターン1: ライセンス費用が欠落している場合
    const incompleteDataMissingLicenseCost = {
      salesforceLicenseCost: undefined,
      initialConstructionCost: 5000000,
      annualMaintenanceCost: 1200000,
      years: 3,
    };

    expect(() =>
      calculateROIComparison(incompleteDataMissingLicenseCost)
    ).toThrow(/ライセンス費用/);

    // パターン2: 導入コストが欠落している場合
    const incompleteDataMissingInitialCost = {
      salesforceLicenseCost: 2400000,
      initialConstructionCost: undefined,
      annualMaintenanceCost: 1200000,
      years: 3,
    };

    expect(() =>
      calculateROIComparison(incompleteDataMissingInitialCost)
    ).toThrow(/導入コスト|初期構築コスト/);

    // パターン3: 運用保守費が欠落している場合
    const incompleteDataMissingMaintenanceCost = {
      salesforceLicenseCost: 2400000,
      initialConstructionCost: 5000000,
      annualMaintenanceCost: undefined,
      years: 3,
    };

    expect(() =>
      calculateROIComparison(incompleteDataMissingMaintenanceCost)
    ).toThrow(/運用保守費|年間保守|保守費用/);

    // パターン4: 年数が欠落している場合
    const incompleteDataMissingYears = {
      salesforceLicenseCost: 2400000,
      initialConstructionCost: 5000000,
      annualMaintenanceCost: 1200000,
      years: undefined,
    };

    expect(() =>
      calculateROIComparison(incompleteDataMissingYears)
    ).toThrow(/年数|期間/);

    // パターン5: ライセンス費用が null の場合
    const nullLicenseCost = {
      salesforceLicenseCost: null,
      initialConstructionCost: 5000000,
      annualMaintenanceCost: 1200000,
      years: 3,
    };

    expect(() =>
      calculateROIComparison(nullLicenseCost as any)
    ).toThrow(/ライセンス費用/);

    // パターン6: 複数の項目が欠落している場合（最初に見つかった項目のエラーを返す）
    const multipleItemsMissing = {
      salesforceLicenseCost: undefined,
      initialConstructionCost: undefined,
      annualMaintenanceCost: 1200000,
      years: 3,
    };

    expect(() =>
      calculateROIComparison(multipleItemsMissing)
    ).toThrow(/ライセンス費用|導入コスト|初期構築コスト/);

    // パターン7: 完全なデータが提供された場合は正常に計算される（逆証）
    const completeData = {
      salesforceLicenseCost: 2400000,
      initialConstructionCost: 5000000,
      annualMaintenanceCost: 1200000,
      years: 3,
    };

    const result = calculateROIComparison(completeData);

    // 3年間のSalesforce継続コスト: 2,400,000 × 3 = 7,200,000
    // 自社開発システム総コスト: 5,000,000 + (1,200,000 × 3) = 8,600,000
    expect(result).toEqual({
      salesforceTotalCost: 7200000,
      developmentTotalCost: 8600000,
      roi: expect.any(Number),
      annualSavings: expect.any(Number),
      breakEvenYear: expect.any(Number),
    });

    // ROI計算: (7,200,000 - 8,600,000) / 8,600,000 = -0.1628 (-16.28%)
    // 3年目までは自社開発の方がコストが高い
    expect(result.roi).toBeLessThan(0);

    // 年間削減額: (7,200,000 - 8,600,000) / 3 = -466,667
    expect(result.annualSavings).toBeLessThan(0);
  });
});