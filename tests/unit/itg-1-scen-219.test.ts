import { validateInvoiceAmount } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-219
  test('顧客請求内容照合検証 - 請求金額が期待値と許容範囲内の差異である場合に検証完了と判定される', () => {
    const expected_amount = 100000;
    const tolerance_rate = 0.01;
    const actual_amount = 100500;

    const min_acceptable = expected_amount * (1 - tolerance_rate);
    const max_acceptable = expected_amount * (1 + tolerance_rate);

    const result = validateInvoiceAmount({
      expected_amount: expected_amount,
      actual_amount: actual_amount,
      tolerance_rate: tolerance_rate
    });

    expect(result.is_valid).toBe(true);
    expect(result.status).toBe('合格');
    expect(result.variance_amount).toBe(500);
    expect(result.variance_rate).toBeCloseTo(0.005, 5);
    expect(actual_amount).toBeGreaterThanOrEqual(min_acceptable);
    expect(actual_amount).toBeLessThanOrEqual(max_acceptable);
  });
});