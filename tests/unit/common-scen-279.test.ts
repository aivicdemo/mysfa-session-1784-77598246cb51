import { calculateInitialConstructionCost, calculateAnnualMaintenanceCost } from '../../src/logic/common';

describe('共通', () => {
  // SCEN-279
  test('初期構築コスト・年間保守運用コスト算出機能 - 工数が小数値の場合、適切に丸められて計算される', () => {
    // パターン1: 工数 10.5時間、単価 10000円/時間
    // 期待: 四捨五入で 11時間 → 初期構築コスト = 11 * 10000 = 110000
    const result1_construction = calculateInitialConstructionCost({
      hours: 10.5,
      hourlyRate: 10000,
    });
    expect(result1_construction).toBe(110000);

    // パターン2: 工数 25.75時間、単価 8000円/時間
    // 期待: 四捨五入で 26時間 → 初期構築コスト = 26 * 8000 = 208000
    const result2_construction = calculateInitialConstructionCost({
      hours: 25.75,
      hourlyRate: 8000,
    });
    expect(result2_construction).toBe(208000);

    // パターン3: 工数 0.1時間、単価 5000円/時間
    // 期待: 四捨五入で 0時間 → 初期構築コスト = 0 * 5000 = 0
    const result3_construction = calculateInitialConstructionCost({
      hours: 0.1,
      hourlyRate: 5000,
    });
    expect(result3_construction).toBe(0);

    // パターン4: 工数 0.5時間、単価 12000円/時間
    // 期待: 四捨五入で 1時間（0.5は偶数への丸めまたは0.5以上で切り上げ） → 初期構築コスト = 1 * 12000 = 12000
    const result4_construction = calculateInitialConstructionCost({
      hours: 0.5,
      hourlyRate: 12000,
    });
    expect(result4_construction).toBe(12000);

    // パターン5: 工数 0.9時間、単価 15000円/時間
    // 期待: 四捨五入で 1時間 → 初期構築コスト = 1 * 15000 = 15000
    const result5_construction = calculateInitialConstructionCost({
      hours: 0.9,
      hourlyRate: 15000,
    });
    expect(result5_construction).toBe(15000);

    // 年間保守運用コスト検証
    // パターン1: 工数 10.5時間/月、単価 10000円/時間、月数 12
    // 期待: 四捨五入で 11時間 → 年間保守運用コスト = 11 * 10000 * 12 = 1320000
    const result1_maintenance = calculateAnnualMaintenanceCost({
      hours: 10.5,
      hourlyRate: 10000,
      months: 12,
    });
    expect(result1_maintenance).toBe(1320000);

    // パターン2: 工数 25.75時間/月、単価 8000円/時間、月数 12
    // 期待: 四捨五入で 26時間 → 年間保守運用コスト = 26 * 8000 * 12 = 2496000
    const result2_maintenance = calculateAnnualMaintenanceCost({
      hours: 25.75,
      hourlyRate: 8000,
      months: 12,
    });
    expect(result2_maintenance).toBe(2496000);

    // パターン3: 工数 0.1時間/月、単価 5000円/時間、月数 12
    // 期待: 四捨五入で 0時間 → 年間保守運用コスト = 0 * 5000 * 12 = 0
    const result3_maintenance = calculateAnnualMaintenanceCost({
      hours: 0.1,
      hourlyRate: 5000,
      months: 12,
    });
    expect(result3_maintenance).toBe(0);

    // パターン4: 工数 0.5時間/月、単価 12000円/時間、月数 12
    // 期待: 四捨五入で 1時間 → 年間保守運用コスト = 1 * 12000 * 12 = 144000
    const result4_maintenance = calculateAnnualMaintenanceCost({
      hours: 0.5,
      hourlyRate: 12000,
      months: 12,
    });
    expect(result4_maintenance).toBe(144000);

    // パターン5: 工数 0.9時間/月、単価 15000円/時間、月数 12
    // 期待: 四捨五入で 1時間 → 年間保守運用コスト = 1 * 15000 * 12 = 180000
    const result5_maintenance = calculateAnnualMaintenanceCost({
      hours: 0.9,
      hourlyRate: 15000,
      months: 12,
    });
    expect(result5_maintenance).toBe(180000);
  });
});