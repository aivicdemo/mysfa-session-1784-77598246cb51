import { aggregateCustomerDealProgress } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-194
  test('顧客別商談進捗集計機能 - 失注ステータスの商談が複数件のとき、合計金額が正確に集計される', () => {
    const customerId = 'CUST-001';
    const customerName = 'テスト顧客A';

    const deals = [
      {
        dealId: 'DEAL-001',
        customerId: customerId,
        dealName: '案件1',
        status: '失注',
        amount: 500000,
      },
      {
        dealId: 'DEAL-002',
        customerId: customerId,
        dealName: '案件2',
        status: '失注',
        amount: 300000,
      },
      {
        dealId: 'DEAL-003',
        customerId: customerId,
        dealName: '案件3',
        status: '失注',
        amount: 200000,
      },
    ];

    const result = aggregateCustomerDealProgress(customerId, customerName, deals);

    expect(result.customerId).toBe(customerId);
    expect(result.customerName).toBe(customerName);
    expect(result.progressByStatus).toEqual(
      expect.objectContaining({
        失注: {
          count: 3,
          totalAmount: 1000000,
        },
      })
    );
    expect(result.progressByStatus.失注.totalAmount).toBe(1000000);
  });
});