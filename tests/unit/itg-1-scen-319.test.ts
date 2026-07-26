import { calculateLicenseCostComparison } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-319
  test('年間保守運用コストが入力されない場合に比較計算がスキップされ、警告メッセージが表示される', () => {
    const input = {
      salesforceLicenseCost: 100000,
      initialConstructionCost: 50000,
      annualMaintenanceCost: null,
    };

    const result = calculateLicenseCostComparison(input);

    expect(result).toEqual({
      comparisonSkipped: true,
      warningMessage: '年間保守運用コストが入力されていません',
      comparisonResult: null,
      hasError: false,
    });
    expect(result.comparisonResult).toBeNull();
  });
});