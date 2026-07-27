import { aggregateCustomerDealProgress } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-170
  test('顧客別商談進捗集計機能 - 提案中ステータスの商談件数が複数件のとき、その件数が正確に集計される', () => {
    const customerId = 'CUST001';

    const deals = [
      {
        customerId: 'CUST001',
        dealId: 'DEAL001',
        status: '提案中',
        amount: 1000000,
      },
      {
        customerId: 'CUST001',
        dealId: 'DEAL002',
        status: '提案中',
        amount: 2000000,
      },
      {
        customerId: 'CUST001',
        dealId: 'DEAL003',
        status: '提案中',
        amount: 1500000,
      },
      {
        customerId: 'CUST001',
        dealId: 'DEAL004',
        status: '受注',
        amount: 3000000,
      },
      {
        customerId: 'CUST001',
        dealId: 'DEAL005',
        status: '失注',
        amount: 500000,
      },
    ];

    const result = aggregateCustomerDealProgress(customerId, deals);

    expect(result).toEqual({
      customerId: 'CUST001',
      statuses: [
        {
          statusName: '提案中',
          count: 3,
          totalAmount: 4500000,
        },
        {
          statusName: '受注',
          count: 1,
          totalAmount: 3000000,
        },
        {
          statusName: '失注',
          count: 1,
          totalAmount: 500000,
        },
      ],
    });

    const proposalStatus = result.statuses.find(
      (s) => s.statusName === '提案中'
    );
    expect(proposalStatus?.count).toBe(3);
    expect(proposalStatus?.totalAmount).toBe(4500000);
  });
});