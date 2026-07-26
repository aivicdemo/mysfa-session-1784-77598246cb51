import { validateBillingDataReasonableness } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-247
  test('請求対象データ妥当性検証機能 - 金額の異常値（マイナス・極端に大きい値）の場合の妥当性判定が正確に実行される', () => {
    // マイナス金額のケース
    const negative_amount_data = {
      deal_id: 'DEAL-001',
      customer_id: 'CUST-001',
      customer_name: '株式会社テスト',
      amount: -1000,
      line_count: 2,
      invoice_date: '2024-04-15',
    };
    const negative_result = validateBillingDataReasonableness(negative_amount_data);
    expect(negative_result.is_valid).toBe(false);
    expect(negative_result.error_message).toMatch(/金額|マイナス/);

    // 極端に大きい金額のケース
    const extreme_large_amount_data = {
      deal_id: 'DEAL-002',
      customer_id: 'CUST-002',
      customer_name: '株式会社テスト2',
      amount: 999999999999,
      line_count: 3,
      invoice_date: '2024-04-15',
    };
    const extreme_large_result = validateBillingDataReasonableness(extreme_large_amount_data);
    expect(extreme_large_result.is_valid).toBe(false);
    expect(extreme_large_result.error_message).toMatch(/金額|上限/);

    // 正常範囲の金額のケース
    const normal_amount_data = {
      deal_id: 'DEAL-003',
      customer_id: 'CUST-003',
      customer_name: '株式会社テスト3',
      amount: 10000,
      line_count: 2,
      invoice_date: '2024-04-15',
    };
    const normal_result = validateBillingDataReasonableness(normal_amount_data);
    expect(normal_result.is_valid).toBe(true);
    expect(normal_result.error_message).toBeNull();

    // 境界値：ゼロのケース（妥当性検証では不合格）
    const zero_amount_data = {
      deal_id: 'DEAL-004',
      customer_id: 'CUST-004',
      customer_name: '株式会社テスト4',
      amount: 0,
      line_count: 1,
      invoice_date: '2024-04-15',
    };
    const zero_result = validateBillingDataReasonableness(zero_amount_data);
    expect(zero_result.is_valid).toBe(false);
    expect(zero_result.error_message).toMatch(/金額/);

    // 境界値：正常範囲の最小値のケース
    const min_normal_amount_data = {
      deal_id: 'DEAL-005',
      customer_id: 'CUST-005',
      customer_name: '株式会社テスト5',
      amount: 1,
      line_count: 1,
      invoice_date: '2024-04-15',
    };
    const min_normal_result = validateBillingDataReasonableness(min_normal_amount_data);
    expect(min_normal_result.is_valid).toBe(true);
    expect(min_normal_result.error_message).toBeNull();

    // 境界値：正常範囲の最大値のケース（例：10億円）
    const max_normal_amount_data = {
      deal_id: 'DEAL-006',
      customer_id: 'CUST-006',
      customer_name: '株式会社テスト6',
      amount: 1000000000,
      line_count: 5,
      invoice_date: '2024-04-15',
    };
    const max_normal_result = validateBillingDataReasonableness(max_normal_amount_data);
    expect(max_normal_result.is_valid).toBe(true);
    expect(max_normal_result.error_message).toBeNull();
  });
});