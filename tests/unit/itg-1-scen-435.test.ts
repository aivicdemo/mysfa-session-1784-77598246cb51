import { fetchCustomerRecordWithCache } from '../../src/logic/it-1';

describe('顧客レコード画面の商談履歴・活動記録表示', () => {
  // SCEN-435
  test('キャッシュ有効期限を超過した場合、データベースから最新データを再取得して表示する', async () => {
    const customerId = 'CUST-001';
    const cacheExpirationMinutes = 60;
    const currentTime = new Date('2024-01-15T12:00:00Z');
    const expiredCacheTime = new Date('2024-01-15T10:59:00Z');

    const mockDealHistory = [
      {
        dealId: 'DEAL-001',
        customerId: customerId,
        dealName: '商談A',
        amount: 500000,
        status: '交渉中',
        createdAt: '2024-01-10T10:00:00Z',
      },
      {
        dealId: 'DEAL-002',
        customerId: customerId,
        dealName: '商談B',
        amount: 300000,
        status: '提案中',
        createdAt: '2024-01-12T14:00:00Z',
      },
      {
        dealId: 'DEAL-003',
        customerId: customerId,
        dealName: '商談C',
        amount: 150000,
        status: '初期接触',
        createdAt: '2024-01-14T09:00:00Z',
      },
    ];

    const mockActivityRecords = [
      {
        activityId: 'ACT-001',
        dealId: 'DEAL-001',
        type: 'email',
        description: 'メール送信',
        timestamp: '2024-01-10T10:30:00Z',
      },
      {
        activityId: 'ACT-002',
        dealId: 'DEAL-001',
        type: 'call',
        description: '電話対応',
        timestamp: '2024-01-11T15:00:00Z',
      },
      {
        activityId: 'ACT-003',
        dealId: 'DEAL-002',
        type: 'visit',
        description: '訪問',
        timestamp: '2024-01-12T14:30:00Z',
      },
      {
        activityId: 'ACT-004',
        dealId: 'DEAL-002',
        type: 'email',
        description: 'フォローアップメール',
        timestamp: '2024-01-13T11:00:00Z',
      },
      {
        activityId: 'ACT-005',
        dealId: 'DEAL-003',
        type: 'call',
        description: '初回コール',
        timestamp: '2024-01-14T09:30:00Z',
      },
    ];

    const mockDatabaseQuery = jest.fn().mockResolvedValue({
      dealHistory: mockDealHistory,
      activityRecords: mockActivityRecords,
    });

    const mockCacheStore = {
      data: null,
      timestamp: expiredCacheTime,
      isExpired(now: Date): boolean {
        const elapsedMinutes =
          (now.getTime() - this.timestamp.getTime()) / (1000 * 60);
        return elapsedMinutes > cacheExpirationMinutes;
      },
    };

    const result = await fetchCustomerRecordWithCache(
      customerId,
      mockDatabaseQuery,
      mockCacheStore,
      currentTime
    );

    expect(mockDatabaseQuery).toHaveBeenCalledTimes(1);
    expect(mockDatabaseQuery).toHaveBeenCalledWith(customerId);

    expect(result.dealHistory).toHaveLength(3);
    expect(result.dealHistory).toEqual(mockDealHistory);

    expect(result.activityRecords).toHaveLength(5);
    expect(result.activityRecords).toEqual(mockActivityRecords);

    expect(result.dealHistory[0]).toEqual({
      dealId: 'DEAL-001',
      customerId: 'CUST-001',
      dealName: '商談A',
      amount: 500000,
      status: '交渉中',
      createdAt: '2024-01-10T10:00:00Z',
    });

    expect(result.activityRecords[0]).toEqual({
      activityId: 'ACT-001',
      dealId: 'DEAL-001',
      type: 'email',
      description: 'メール送信',
      timestamp: '2024-01-10T10:30:00Z',
    });

    expect(result.activityRecords[result.activityRecords.length - 1]).toEqual({
      activityId: 'ACT-005',
      dealId: 'DEAL-003',
      type: 'call',
      description: '初回コール',
      timestamp: '2024-01-14T09:30:00Z',
    });
  });
});