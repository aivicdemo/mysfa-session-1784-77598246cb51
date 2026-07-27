import { aggregateDealProgressByCustomer } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-190
  test('受注ステータスの商談が1件で金額が0円を超えるとき、その金額が正確に集計される', () => {
    const customerId = 'CUST-001';
    const dealAmount = 150000;
    const dealStatus = '受注';

    const testDeal = {
      id: 'DEAL-001',
      customerId: customerId,
      amount: dealAmount,
      status: dealStatus,
    };

    const filterCondition = {
      status: '受注',
    };

    const result = aggregateDealProgressByCustomer(
      customerId,
      [testDeal],
      filterCondition
    );

    expect(result.customerId).toBe(customerId);
    expect(result.closedAmount).toBe(150000);
    expect(result.closedCount).toBe(1);
  });
});