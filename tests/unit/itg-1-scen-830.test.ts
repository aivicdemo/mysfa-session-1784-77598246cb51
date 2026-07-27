import { validateBillingTargetData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-830
  test('請求対象データ妥当性検証機能 - 請求明細に商品IDが欠けている行を含むとき、該当データを不承認と判定する', () => {
    const billingLines = [
      {
        lineNumber: 1,
        productId: 'PROD001',
        quantity: 1,
        unitPrice: 1000,
      },
      {
        lineNumber: 2,
        productId: null,
        quantity: 2,
        unitPrice: 500,
      },
      {
        lineNumber: 3,
        productId: 'PROD003',
        quantity: 1,
        unitPrice: 2000,
      },
    ];

    const billingData = {
      customerId: 'CUST001',
      customerName: 'テスト株式会社',
      billingAmount: 5000,
      billingLines: billingLines,
      billingDate: '2024-01-15',
    };

    const result = validateBillingTargetData(billingData);

    expect(result.status).toBe('REJECTED');
    expect(result.isApproved).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        lineNumber: 2,
        errorMessage: expect.stringMatching(/商品ID/),
      })
    );
    expect(result.validLines).toEqual([1, 3]);
  });
});