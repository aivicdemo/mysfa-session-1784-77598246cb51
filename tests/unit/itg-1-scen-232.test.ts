import { calculateAnnualSavings } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-232
  test('ライセンス費用対効果分析機能 - Salesforceライセンス年間費用から自社システム運用コストを差し引き、年間削減額が正確に算出される', () => {
    // 入力データ
    const salesforceAnnualCost = 1200000;
    const internalSystemOperationCost = 300000;

    // 実行
    const result = calculateAnnualSavings({
      salesforceAnnualCost,
      internalSystemOperationCost,
    });

    // 期待値: 1,200,000 - 300,000 = 900,000
    expect(result.annualSavingsAmount).toBe(900000);

    // 通貨形式での表示を確認
    expect(result.annualSavingsFormatted).toBe('¥900,000');

    // 小数点以下が存在する場合の四捨五入を確認
    const resultWithDecimal = calculateAnnualSavings({
      salesforceAnnualCost: 1200000.567,
      internalSystemOperationCost: 300000.789,
    });

    // 1,200,000.567 - 300,000.789 = 899,999.778 → 四捨五入で 900,000
    expect(resultWithDecimal.annualSavingsAmount).toBe(900000);
    expect(resultWithDecimal.annualSavingsFormatted).toBe('¥900,000');

    // 削減額が負数になるケース（自社システム運用コストがSalesforceライセンス費用より高い）
    const resultNegative = calculateAnnualSavings({
      salesforceAnnualCost: 500000,
      internalSystemOperationCost: 800000,
    });

    // 500,000 - 800,000 = -300,000
    expect(resultNegative.annualSavingsAmount).toBe(-300000);
    expect(resultNegative.annualSavingsFormatted).toBe('-¥300,000');

    // 削減額がゼロになるケース
    const resultZero = calculateAnnualSavings({
      salesforceAnnualCost: 500000,
      internalSystemOperationCost: 500000,
    });

    expect(resultZero.annualSavingsAmount).toBe(0);
    expect(resultZero.annualSavingsFormatted).toBe('¥0');

    // ROI計算を確認（年間削減額 ÷ 初期投資額で投資回収期間を示唆）
    expect(result.roi).toBeDefined();
    expect(typeof result.roi).toBe('number');

    // 結果構造の検証
    expect(result).toHaveProperty('annualSavingsAmount');
    expect(result).toHaveProperty('annualSavingsFormatted');
    expect(result).toHaveProperty('roi');
  });
});