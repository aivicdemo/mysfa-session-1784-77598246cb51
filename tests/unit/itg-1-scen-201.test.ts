import { extractBillingTargetDeals } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-201
  test('請求タイプ判定と請求対象商談の自動抽出機能 - 定義されていない請求タイプが指定された場合、エラーが返される', () => {
    const invalid_billing_type_1 = 'INVALID_TYPE';
    const invalid_billing_type_2 = '999';

    expect(() =>
      extractBillingTargetDeals({
        billing_type: invalid_billing_type_1,
        target_period_start: '2024-04-01',
        target_period_end: '2024-04-30',
        user_id: 'user_001'
      })
    ).toThrow(/請求タイプ/);

    expect(() =>
      extractBillingTargetDeals({
        billing_type: invalid_billing_type_2,
        target_period_start: '2024-04-01',
        target_period_end: '2024-04-30',
        user_id: 'user_001'
      })
    ).toThrow(/請求タイプ/);
  });
});