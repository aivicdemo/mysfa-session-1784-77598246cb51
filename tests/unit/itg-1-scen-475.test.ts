import { fetchDealHistoryWithActivities } from '../../src/logic/it-1';

describe('顧客レコード画面の商談履歴・活動記録表示', () => {
  // SCEN-475
  test('年度をまたぐ商談履歴が含まれているとき、正しく返される', () => {
    const customerId = 'CUST-001';

    const mockDealHistory = [
      {
        dealId: 'DEAL-2023-001',
        dealName: '2023年度商談A',
        closeDate: new Date('2023-04-15T00:00:00Z'),
        status: '受注',
        amount: 1000000,
      },
      {
        dealId: 'DEAL-2023-002',
        dealName: '2023年度商談B',
        closeDate: new Date('2023-08-20T00:00:00Z'),
        status: '進行中',
        amount: 500000,
      },
      {
        dealId: 'DEAL-2023-003',
        dealName: '2023年度商談C',
        closeDate: new Date('2024-02-10T00:00:00Z'),
        status: '受注',
        amount: 750000,
      },
      {
        dealId: 'DEAL-2024-001',
        dealName: '2024年度商談D',
        closeDate: new Date('2024-05-25T00:00:00Z'),
        status: '受注',
        amount: 1200000,
      },
      {
        dealId: 'DEAL-2024-002',
        dealName: '2024年度商談E',
        closeDate: new Date('2024-07-30T00:00:00Z'),
        status: '進行中',
        amount: 600000,
      },
    ];

    const result = fetchDealHistoryWithActivities(customerId, mockDealHistory);

    expect(result).toBeDefined();
    expect(result.length).toBe(5);

    expect(result[0].dealId).toBe('DEAL-2024-002');
    expect(result[0].closeDate).toEqual(new Date('2024-07-30T00:00:00Z'));
    expect(result[0].dealName).toBe('2024年度商談E');
    expect(result[0].amount).toBe(600000);

    expect(result[1].dealId).toBe('DEAL-2024-001');
    expect(result[1].closeDate).toEqual(new Date('2024-05-25T00:00:00Z'));
    expect(result[1].dealName).toBe('2024年度商談D');
    expect(result[1].amount).toBe(1200000);

    expect(result[2].dealId).toBe('DEAL-2023-003');
    expect(result[2].closeDate).toEqual(new Date('2024-02-10T00:00:00Z'));
    expect(result[2].dealName).toBe('2023年度商談C');
    expect(result[2].amount).toBe(750000);

    expect(result[3].dealId).toBe('DEAL-2023-002');
    expect(result[3].closeDate).toEqual(new Date('2023-08-20T00:00:00Z'));
    expect(result[3].dealName).toBe('2023年度商談B');
    expect(result[3].amount).toBe(500000);

    expect(result[4].dealId).toBe('DEAL-2023-001');
    expect(result[4].closeDate).toEqual(new Date('2023-04-15T00:00:00Z'));
    expect(result[4].dealName).toBe('2023年度商談A');
    expect(result[4].amount).toBe(1000000);

    const closeDates = result.map((deal) => deal.closeDate.getTime());
    const isDescending = closeDates.every(
      (date, index) => index === 0 || closeDates[index - 1] >= date
    );
    expect(isDescending).toBe(true);
  });
});