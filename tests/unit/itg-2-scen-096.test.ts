import { determineBillingType } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向け専用ポータルでの商談情報参照機能', () => {
  // SCEN-096
  test('請求実行タイミング判定機能 - 請求タイプが月次と納期後の両方に該当する商談は、優先度に従い単一タイプに絞り込まれる', () => {
    const dealData = {
      dealId: 'DEAL-001',
      dealStatus: '受注',
      billingTypeMonthly: true,
      billingTypeAfterDelivery: true,
      monthlyBillingPriority: 1,
      afterDeliveryBillingPriority: 2,
      expectedBillingDate: '2024-12-31T23:59:59Z',
      deliveryDate: '2024-12-25T00:00:00Z',
    };

    const result = determineBillingType(dealData);

    expect(result).toBe('monthly');
    expect(typeof result).toBe('string');
    expect(['monthly', 'afterDelivery']).toContain(result);
  });
});