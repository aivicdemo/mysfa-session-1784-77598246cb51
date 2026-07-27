import { extractBillingTargetData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-786
  test('請求対象データ抽出機能 - 業務上の最大規模金額のデータが存在するとき、条件に合致すれば抽出される', () => {
    const maxAmountData = {
      id: 'billing-001',
      dealId: 'deal-max-amount',
      customerId: 'cust-max-amount',
      amount: 999999999,
      billingStatus: 'unbilled',
      dueDate: '2024-04-30',
      createdDate: '2024-04-15',
      itemDetails: [
        {
          itemId: 'item-001',
          description: 'サービス提供',
          quantity: 1,
          unitPrice: 999999999,
          lineTotal: 999999999,
        },
      ],
    };

    const testDataset = [maxAmountData];

    const extractionConditions = {
      billingStatus: 'unbilled',
      amountRange: 'all',
      periodStart: '2024-04-01',
      periodEnd: '2024-04-30',
    };

    const result = extractBillingTargetData(testDataset, extractionConditions);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('billing-001');
    expect(result[0].amount).toBe(999999999);
    expect(result[0].billingStatus).toBe('unbilled');
    expect(result[0].itemDetails).toHaveLength(1);
    expect(result[0].itemDetails[0].lineTotal).toBe(999999999);
  });
});