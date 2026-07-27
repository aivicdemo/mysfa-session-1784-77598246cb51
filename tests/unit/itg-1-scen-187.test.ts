import { aggregateDealProgressByCustomer } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-187
  test('交渉中ステータスの商談が1件で金額が0円を超えるとき、その金額が正確に集計される', () => {
    const customerId = 'CUST_A_001';
    const customerName = 'Customer A';
    const dealAmount = 50000;
    const dealStatus = '交渉中';

    const mockDeals = [
      {
        dealId: 'DEAL_001',
        customerId: customerId,
        customerName: customerName,
        status: dealStatus,
        amount: dealAmount,
        createdAt: '2024-01-15T10:00:00Z'
      }
    ];

    const result = aggregateDealProgressByCustomer(mockDeals);

    expect(result).toBeDefined();
    expect(result).toHaveLength(1);

    const customerResult = result[0];
    expect(customerResult.customerId).toBe(customerId);
    expect(customerResult.customerName).toBe(customerName);

    const negotiationProgress = customerResult.progressByStatus.find(
      (status_item) => status_item.status === dealStatus
    );
    expect(negotiationProgress).toBeDefined();
    expect(negotiationProgress.count).toBe(1);
    expect(negotiationProgress.totalAmount).toBe(50000);
  });
});