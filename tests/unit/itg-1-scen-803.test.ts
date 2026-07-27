import { validateBillingData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-803
  test('請求対象データ妥当性検証機能 - 請求明細が0件のとき不承認と判定する', () => {
    const billingData = {
      billingId: 'TEST-803-001',
      customerId: 'CUST-001',
      billingAmount: 50000,
      lineItems: [],
    };

    const result = validateBillingData(billingData);

    expect(result.status).toBe('不承認');
    expect(result.errorCode).toBe('BILLING_LINE_ITEMS_EMPTY');
    expect(result.errorMessage).toBe('請求明細が0件のため、このデータは承認できません');
  });
});