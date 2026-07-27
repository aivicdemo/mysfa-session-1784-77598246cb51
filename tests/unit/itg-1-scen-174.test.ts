import { aggregateDealProgressByCustomer } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-174
  test('顧客別商談進捗集計機能 - 受注ステータスの商談件数が0件のとき、その件数が0として集計される', () => {
    const customerId = 'CUST_001';
    const customerName = 'テスト顧客A';

    const dealsData = [
      {
        customerId: customerId,
        dealId: 'DEAL_001',
        dealName: '商談1',
        status: 'estimation',
        amount: 100000,
      },
      {
        customerId: customerId,
        dealId: 'DEAL_002',
        dealName: '商談2',
        status: 'proposal',
        amount: 200000,
      },
      {
        customerId: customerId,
        dealId: 'DEAL_003',
        dealName: '商談3',
        status: 'negotiation',
        amount: 150000,
      },
      {
        customerId: customerId,
        dealId: 'DEAL_004',
        dealName: '商談4',
        status: 'lost',
        amount: 50000,
      },
    ];

    const customersData = [
      {
        customerId: customerId,
        customerName: customerName,
      },
    ];

    const result = aggregateDealProgressByCustomer(customersData, dealsData);

    expect(result).toEqual([
      {
        customerId: customerId,
        customerName: customerName,
        progressSummary: {
          estimation: {
            count: 1,
            totalAmount: 100000,
          },
          proposal: {
            count: 1,
            totalAmount: 200000,
          },
          negotiation: {
            count: 1,
            totalAmount: 150000,
          },
          contract: {
            count: 0,
            totalAmount: 0,
          },
          lost: {
            count: 1,
            totalAmount: 50000,
          },
        },
      },
    ]);

    expect(result[0].progressSummary.contract.count).toBe(0);
    expect(typeof result[0].progressSummary.contract.count).toBe('number');
    expect(result[0].progressSummary.estimation.count).toBe(1);
    expect(result[0].progressSummary.proposal.count).toBe(1);
    expect(result[0].progressSummary.negotiation.count).toBe(1);
    expect(result[0].progressSummary.lost.count).toBe(1);
  });
});