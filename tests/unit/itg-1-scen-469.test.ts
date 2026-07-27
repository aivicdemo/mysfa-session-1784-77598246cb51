import { fetchDealHistoryByCustomer } from '../../src/logic/it-1';

describe('顧客レコード画面の商談履歴・活動記録表示', () => {
  // SCEN-469
  test('月末日の商談履歴が含まれているとき、正しく返される', () => {
    const customerId = 'CUST_001';
    const dealHistories = [
      {
        id: 'DEAL_A',
        customerId: customerId,
        dealName: '商談A',
        dealDate: new Date('2024-01-31T09:00:00Z'),
        amount: 1000000,
        status: '成約',
        activityRecords: [],
      },
      {
        id: 'DEAL_B',
        customerId: customerId,
        dealName: '商談B',
        dealDate: new Date('2024-02-29T09:00:00Z'),
        amount: 1500000,
        status: '成約',
        activityRecords: [],
      },
      {
        id: 'DEAL_C',
        customerId: customerId,
        dealName: '商談C',
        dealDate: new Date('2024-03-31T09:00:00Z'),
        amount: 2000000,
        status: '提案中',
        activityRecords: [],
      },
    ];

    const result = fetchDealHistoryByCustomer(customerId, dealHistories);

    expect(result).toEqual([
      {
        id: 'DEAL_A',
        customerId: customerId,
        dealName: '商談A',
        dealDate: new Date('2024-01-31T09:00:00Z'),
        amount: 1000000,
        status: '成約',
        activityRecords: [],
      },
      {
        id: 'DEAL_B',
        customerId: customerId,
        dealName: '商談B',
        dealDate: new Date('2024-02-29T09:00:00Z'),
        amount: 1500000,
        status: '成約',
        activityRecords: [],
      },
      {
        id: 'DEAL_C',
        customerId: customerId,
        dealName: '商談C',
        dealDate: new Date('2024-03-31T09:00:00Z'),
        amount: 2000000,
        status: '提案中',
        activityRecords: [],
      },
    ]);

    expect(result.length).toBe(3);
    expect(result[0].dealDate).toEqual(new Date('2024-01-31T09:00:00Z'));
    expect(result[0].amount).toBe(1000000);
    expect(result[0].status).toBe('成約');
    expect(result[1].dealDate).toEqual(new Date('2024-02-29T09:00:00Z'));
    expect(result[1].amount).toBe(1500000);
    expect(result[1].status).toBe('成約');
    expect(result[2].dealDate).toEqual(new Date('2024-03-31T09:00:00Z'));
    expect(result[2].amount).toBe(2000000);
    expect(result[2].status).toBe('提案中');
  });
});