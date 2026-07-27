import { aggregateCustomerDealProgress } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-178
  test('失注ステータスの商談件数が1件のとき、その件数が1として集計される', () => {
    const customerId = 'CUST-001';
    const dealRecords = [
      {
        dealId: 'DEAL-001',
        customerId: customerId,
        dealStatus: '失注',
        dealAmount: 500000,
      },
    ];

    const result = aggregateCustomerDealProgress(dealRecords, customerId);

    expect(result.customerId).toBe(customerId);
    expect(result.lostCount).toBe(1);
    expect(result.totalDeals).toBe(1);
  });
});