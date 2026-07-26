import { determineBillingExecutionTiming } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-237
  test('請求実行タイミング判定機能 - 納期後請求タイプとカスタム請求タイプが正しく判別される', () => {
    const now = new Date('2024-04-15T10:00:00Z');

    // Case 1: 納期後請求タイプ - 納期日が過去
    const afterDeliveryBillingProduct = {
      dealId: 'DEAL001',
      productId: 'PROD001',
      billingType: 'AFTER_DELIVERY',
      deliveryDate: new Date('2024-04-10T00:00:00Z'),
      customBillingRule: null,
    };

    const afterDeliveryResult = determineBillingExecutionTiming(
      afterDeliveryBillingProduct,
      now
    );

    expect(afterDeliveryResult.billingType).toBe('AFTER_DELIVERY');
    expect(afterDeliveryResult.shouldExecuteBilling).toBe(true);
    expect(afterDeliveryResult.executionTiming).toBe('AFTER_DELIVERY');

    // Case 2: カスタム請求タイプ - 指定日時到達
    const customBillingProduct = {
      dealId: 'DEAL002',
      productId: 'PROD002',
      billingType: 'CUSTOM',
      deliveryDate: new Date('2024-04-20T00:00:00Z'),
      customBillingRule: {
        billingDate: new Date('2024-04-12T00:00:00Z'),
        billingDay: null,
        billingMonth: null,
      },
    };

    const customResult = determineBillingExecutionTiming(
      customBillingProduct,
      now
    );

    expect(customResult.billingType).toBe('CUSTOM');
    expect(customResult.shouldExecuteBilling).toBe(true);
    expect(customResult.executionTiming).toBe('CUSTOM');

    // Case 3: 月次請求タイプ（参考: 2024-04の月次請求の場合）
    const monthlyBillingProduct = {
      dealId: 'DEAL003',
      productId: 'PROD003',
      billingType: 'MONTHLY',
      deliveryDate: new Date('2024-03-15T00:00:00Z'),
      customBillingRule: null,
    };

    const monthlyResult = determineBillingExecutionTiming(
      monthlyBillingProduct,
      now
    );

    expect(monthlyResult.billingType).toBe('MONTHLY');
    expect(monthlyResult.shouldExecuteBilling).toBe(true);
    expect(monthlyResult.executionTiming).toBe('MONTHLY');

    // Case 4: 納期後請求タイプ - 納期日がまだ未来の場合は請求対象外
    const futureDeliveryProduct = {
      dealId: 'DEAL004',
      productId: 'PROD004',
      billingType: 'AFTER_DELIVERY',
      deliveryDate: new Date('2024-04-25T00:00:00Z'),
      customBillingRule: null,
    };

    const futureResult = determineBillingExecutionTiming(
      futureDeliveryProduct,
      now
    );

    expect(futureResult.billingType).toBe('AFTER_DELIVERY');
    expect(futureResult.shouldExecuteBilling).toBe(false);
    expect(futureResult.executionTiming).toBe('AFTER_DELIVERY');

    // Case 5: カスタム請求タイプ - 指定日時がまだ未来の場合は請求対象外
    const futureCustomProduct = {
      dealId: 'DEAL005',
      productId: 'PROD005',
      billingType: 'CUSTOM',
      deliveryDate: new Date('2024-04-20T00:00:00Z'),
      customBillingRule: {
        billingDate: new Date('2024-05-01T00:00:00Z'),
        billingDay: null,
        billingMonth: null,
      },
    };

    const futureCustomResult = determineBillingExecutionTiming(
      futureCustomProduct,
      now
    );

    expect(futureCustomResult.billingType).toBe('CUSTOM');
    expect(futureCustomResult.shouldExecuteBilling).toBe(false);
    expect(futureCustomResult.executionTiming).toBe('CUSTOM');

    // Case 6: 混在シナリオ - 複数商品が同時に判定される場合の検証
    const mixedProducts = [
      afterDeliveryBillingProduct,
      customBillingProduct,
      monthlyBillingProduct,
    ];

    const mixedResults = mixedProducts.map((product) =>
      determineBillingExecutionTiming(product, now)
    );

    expect(mixedResults).toHaveLength(3);
    expect(mixedResults[0].billingType).toBe('AFTER_DELIVERY');
    expect(mixedResults[0].shouldExecuteBilling).toBe(true);
    expect(mixedResults[1].billingType).toBe('CUSTOM');
    expect(mixedResults[1].shouldExecuteBilling).toBe(true);
    expect(mixedResults[2].billingType).toBe('MONTHLY');
    expect(mixedResults[2].shouldExecuteBilling).toBe(true);

    // 各タイプの請求実行タイミングが正しく識別されることを確認
    expect(mixedResults[0].executionTiming).toBe('AFTER_DELIVERY');
    expect(mixedResults[1].executionTiming).toBe('CUSTOM');
    expect(mixedResults[2].executionTiming).toBe('MONTHLY');
  });
});