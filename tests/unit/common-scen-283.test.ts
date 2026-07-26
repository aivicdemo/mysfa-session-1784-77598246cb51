import { calculateAnnualMaintenanceCost } from '../../src/logic/common';

describe('共通', () => {
  // SCEN-283
  test('年間保守運用コスト算出機能 - 運用工数が小数値の場合、正確に計算される', () => {
    const unitPrice = 1000000; // 単価: 100万円/人月

    // パターン1: 0.5人月
    const result_05 = calculateAnnualMaintenanceCost({
      operatingWorkload: 0.5,
      unitPrice: unitPrice,
    });
    expect(result_05).toBe(500000); // 0.5 × 1,000,000 = 500,000

    // パターン2: 0.25人月
    const result_025 = calculateAnnualMaintenanceCost({
      operatingWorkload: 0.25,
      unitPrice: unitPrice,
    });
    expect(result_025).toBe(250000); // 0.25 × 1,000,000 = 250,000

    // パターン3: 0.75人月
    const result_075 = calculateAnnualMaintenanceCost({
      operatingWorkload: 0.75,
      unitPrice: unitPrice,
    });
    expect(result_075).toBe(750000); // 0.75 × 1,000,000 = 750,000

    // パターン4: 1.5人月
    const result_15 = calculateAnnualMaintenanceCost({
      operatingWorkload: 1.5,
      unitPrice: unitPrice,
    });
    expect(result_15).toBe(1500000); // 1.5 × 1,000,000 = 1,500,000

    // パターン5: 2.333人月（3進小数のテスト）
    const result_2333 = calculateAnnualMaintenanceCost({
      operatingWorkload: 2.333,
      unitPrice: unitPrice,
    });
    expect(result_2333).toBe(2333000); // 2.333 × 1,000,000 = 2,333,000

    // パターン6: 異なる単価での検証 (単価50万円/人月)
    const unitPrice_500k = 500000;
    const result_with_different_price = calculateAnnualMaintenanceCost({
      operatingWorkload: 0.5,
      unitPrice: unitPrice_500k,
    });
    expect(result_with_different_price).toBe(250000); // 0.5 × 500,000 = 250,000
  });
});