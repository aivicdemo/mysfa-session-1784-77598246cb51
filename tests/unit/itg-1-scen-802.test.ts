import { validateBillingData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け - 請求対象データの妥当性確認', () => {
  // SCEN-802
  test('請求金額が欠けているとき、該当データを不承認と判定する', () => {
    const billingDataWithoutAmount = {
      billingId: 'BILL-20240415-001',
      customerId: 'CUST-12345',
      billingDate: new Date('2024-04-15T09:00:00Z'),
      billingPeriodStart: new Date('2024-04-01T00:00:00Z'),
      billingPeriodEnd: new Date('2024-04-30T23:59:59Z'),
      billingAmount: null,
    };

    expect(() => {
      validateBillingData(billingDataWithoutAmount);
    }).toThrow(/請求金額/);
  });
});