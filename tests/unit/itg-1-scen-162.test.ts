import { aggregateCustomerDealProgress } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-162
  test('顧客別商談進捗集計 - 商談が0件の顧客は除外される', () => {
    const customers = [
      { customerId: 'CUST_A', customerName: '顧客A' },
      { customerId: 'CUST_B', customerName: '顧客B' },
      { customerId: 'CUST_C', customerName: '顧客C' },
    ];

    const deals = [
      {
        dealId: 'DEAL_001',
        customerId: 'CUST_A',
        status: '進行中',
        amount: 500000,
        dealDate: '2024-04-05',
      },
      {
        dealId: 'DEAL_002',
        customerId: 'CUST_A',
        status: '提案中',
        amount: 300000,
        dealDate: '2024-04-10',
      },
      {
        dealId: 'DEAL_003',
        customerId: 'CUST_B',
        status: '受注',
        amount: 1000000,
        dealDate: '2024-04-15',
      },
    ];

    const aggregationPeriod = {
      startDate: '2024-04-01',
      endDate: '2024-04-30',
    };

    const result = aggregateCustomerDealProgress(
      customers,
      deals,
      aggregationPeriod
    );

    expect(result).toHaveLength(2);

    const customerAResult = result.find(
      (r) => r.customerId === 'CUST_A'
    );
    expect(customerAResult).toBeDefined();
    expect(customerAResult?.customerName).toBe('顧客A');
    expect(customerAResult?.dealsByStatus).toEqual({
      '進行中': { count: 1, totalAmount: 500000 },
      '提案中': { count: 1, totalAmount: 300000 },
    });

    const customerBResult = result.find(
      (r) => r.customerId === 'CUST_B'
    );
    expect(customerBResult).toBeDefined();
    expect(customerBResult?.customerName).toBe('顧客B');
    expect(customerBResult?.dealsByStatus).toEqual({
      '受注': { count: 1, totalAmount: 1000000 },
    });

    const customerCResult = result.find(
      (r) => r.customerId === 'CUST_C'
    );
    expect(customerCResult).toBeUndefined();
  });
});