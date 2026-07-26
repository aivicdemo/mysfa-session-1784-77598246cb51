import { extractBillingTargetDataByAmountRange } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-206
  test('金額の境界値（指定範囲の最小値・最大値）が正確に処理される', () => {
    const billing_records = [
      { id: 1, customer_id: 'C001', amount: 0, status: 'pending' },
      { id: 2, customer_id: 'C002', amount: 50000, status: 'pending' },
      { id: 3, customer_id: 'C003', amount: 500000, status: 'pending' },
      { id: 4, customer_id: 'C004', amount: 999999999, status: 'pending' },
      { id: 5, customer_id: 'C005', amount: 1000000000, status: 'pending' },
      { id: 6, customer_id: 'C006', amount: -1, status: 'pending' },
    ];

    const min_amount = 0;
    const max_amount = 999999999;

    const result = extractBillingTargetDataByAmountRange(
      billing_records,
      min_amount,
      max_amount
    );

    expect(result).toHaveLength(4);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 1, amount: 0 }),
        expect.objectContaining({ id: 2, amount: 50000 }),
        expect.objectContaining({ id: 3, amount: 500000 }),
        expect.objectContaining({ id: 4, amount: 999999999 }),
      ])
    );

    const result_ids = result.map((r) => r.id);
    expect(result_ids).not.toContain(5);
    expect(result_ids).not.toContain(6);

    const has_min_boundary = result.some((r) => r.amount === min_amount);
    expect(has_min_boundary).toBe(true);

    const has_max_boundary = result.some((r) => r.amount === max_amount);
    expect(has_max_boundary).toBe(true);

    const has_below_min = result.some((r) => r.amount < min_amount);
    expect(has_below_min).toBe(false);

    const has_above_max = result.some((r) => r.amount > max_amount);
    expect(has_above_max).toBe(false);

    const has_middle_value = result.some(
      (r) => r.amount > min_amount && r.amount < max_amount
    );
    expect(has_middle_value).toBe(true);
  });
});