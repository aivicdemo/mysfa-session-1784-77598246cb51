import { aggregateDealsByCustomerStatus } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-172
  test('交渉中ステータスの商談件数が1件のとき、その件数が1として集計される', () => {
    const customerId = 'CUST-001';
    const dealData = [
      {
        dealId: 'DEAL-001',
        customerId: customerId,
        status: '交渉中',
        amount: 500000,
        dueDate: '2024-04-30',
      },
    ];

    const result = aggregateDealsByCustomerStatus(dealData);

    const customerResult = result.find((item) => item.customerId === customerId);
    expect(customerResult).toBeDefined();
    expect(customerResult?.statusBreakdown).toBeDefined();

    const negotiationStatus = customerResult?.statusBreakdown.find(
      (s) => s.status === '交渉中'
    );
    expect(negotiationStatus?.count).toBe(1);
  });
});