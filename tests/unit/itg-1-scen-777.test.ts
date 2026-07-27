import { extractBillingTargetData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-777
  test('金額下限条件が空のとき、エラーが発生する', () => {
    const billingExtractionInput = {
      maxAmount: 1000000,
      minAmount: null,
      billingPeriodStart: new Date('2024-01-01'),
      billingPeriodEnd: new Date('2024-01-31'),
      customerId: 'CUST-001'
    };

    expect(() => extractBillingTargetData(billingExtractionInput)).toThrow(/金額下限条件/);
  });
});