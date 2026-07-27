import { validateBillingTargetData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け - 請求対象データ妥当性検証', () => {
  // SCEN-829
  test('同じ入力データで2回検証を実行するとき、同じ結果を返す', () => {
    const billingData = {
      customerId: 'CUST-00001',
      customerName: '株式会社テスト',
      billingAmount: 100000,
      billingDate: new Date('2024-04-15T00:00:00Z'),
      dueDate: new Date('2024-05-15T00:00:00Z'),
      billingItems: [
        {
          itemId: 'ITEM-001',
          itemName: '商品A',
          quantity: 10,
          unitPrice: 10000,
          lineAmount: 100000,
        },
      ],
      dealId: 'DEAL-00001',
      dealStatus: 'won',
    };

    const resultFirst = validateBillingTargetData(billingData);
    const resultSecond = validateBillingTargetData(billingData);

    expect(resultFirst.validationStatus).toBe(resultSecond.validationStatus);

    expect(resultFirst.validationErrors).toEqual(resultSecond.validationErrors);

    expect(resultFirst.validationMessages).toEqual(resultSecond.validationMessages);
  });
});