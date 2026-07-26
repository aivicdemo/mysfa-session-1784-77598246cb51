import { calculateAnnualMaintenanceCost } from '../../src/logic/it-1-br-1784969812908-1-1-1';

describe('Salesforce ライセンス利用状況の可視化機能', () => {
  // SCEN-034
  test('年間保守運用コスト算出機能 - 運用工数がゼロの場合に年間保守コストが0として算出される', () => {
    // 運用工数が0の場合のテスト
    const result_zero_operation_hours = calculateAnnualMaintenanceCost({
      operationHours: 0,
      hourlyRate: 5000,
    });
    expect(result_zero_operation_hours).toBe(0);

    // 運用工数が正の値の場合のテスト（基準値確認）
    const result_normal_operation = calculateAnnualMaintenanceCost({
      operationHours: 240,
      hourlyRate: 5000,
    });
    expect(result_normal_operation).toBe(1200000);

    // 運用工数が0で他のコスト要因がある場合のテスト
    const result_with_other_costs = calculateAnnualMaintenanceCost({
      operationHours: 0,
      hourlyRate: 5000,
      fixedCost: 100000,
    });
    expect(result_with_other_costs).toBe(100000);

    // 運用工数が0で固定コストもない場合のテスト
    const result_zero_all = calculateAnnualMaintenanceCost({
      operationHours: 0,
      hourlyRate: 5000,
      fixedCost: 0,
    });
    expect(result_zero_all).toBe(0);

    // 運用工数が小数値の場合のテスト
    const result_decimal_hours = calculateAnnualMaintenanceCost({
      operationHours: 10.5,
      hourlyRate: 5000,
    });
    expect(result_decimal_hours).toBe(52500);

    // 時給が0の場合のテスト
    const result_zero_hourly_rate = calculateAnnualMaintenanceCost({
      operationHours: 240,
      hourlyRate: 0,
    });
    expect(result_zero_hourly_rate).toBe(0);

    // 両方が0の場合のテスト
    const result_both_zero = calculateAnnualMaintenanceCost({
      operationHours: 0,
      hourlyRate: 0,
    });
    expect(result_both_zero).toBe(0);
  });
});