import { fetchDealAndActivityHistory } from '../../src/logic/it-1';

describe('顧客レコード画面の過去商談履歴・活動記録の時系列表示機能', () => {
  // SCEN-395
  test('商談と活動記録が99件のとき、すべて99件が返される', async () => {
    const customerIdArg = 'CUST-12345';
    
    const mockDeals = Array.from({ length: 50 }, (_, i) => ({
      dealId: `DEAL-${String(i + 1).padStart(3, '0')}`,
      dealName: `Deal ${i + 1}`,
      timestamp: new Date(new Date('2024-01-01T12:00:00Z').getTime() + (i * 1000 * 60 * 60)).toISOString(),
      status: i % 2 === 0 ? 'proposal' : 'negotiation',
      amount: 100000 + i * 10000,
    }));

    const mockActivities = Array.from({ length: 49 }, (_, i) => ({
      activityId: `ACT-${String(i + 1).padStart(3, '0')}`,
      activityType: i % 3 === 0 ? 'email' : i % 3 === 1 ? 'call' : 'visit',
      timestamp: new Date(new Date('2024-01-01T08:00:00Z').getTime() + (i * 1000 * 60 * 30)).toISOString(),
      description: `Activity ${i + 1}`,
      notes: `Notes for activity ${i + 1}`,
    }));

    const mockDataSource = {
      getCustomerDealHistory: async (customerId: string) => {
        if (customerId === customerIdArg) {
          return mockDeals;
        }
        return [];
      },
      getCustomerActivityHistory: async (customerId: string) => {
        if (customerId === customerIdArg) {
          return mockActivities;
        }
        return [];
      },
    };

    const result = await fetchDealAndActivityHistory(customerIdArg, mockDataSource);

    expect(result.totalCount).toBe(99);
    expect(result.deals).toHaveLength(50);
    expect(result.activities).toHaveLength(49);

    const allRecords = result.mergedTimeline;
    expect(allRecords).toHaveLength(99);

    for (let i = 0; i < allRecords.length - 1; i++) {
      const currentTimestamp = new Date(allRecords[i].timestamp).getTime();
      const nextTimestamp = new Date(allRecords[i + 1].timestamp).getTime();
      expect(currentTimestamp).toBeGreaterThanOrEqual(nextTimestamp);
    }

    const dealIds = new Set(result.deals.map((d) => d.dealId));
    expect(dealIds.size).toBe(50);

    const activityIds = new Set(result.activities.map((a) => a.activityId));
    expect(activityIds.size).toBe(49);

    const displayedDealIds = result.mergedTimeline
      .filter((r) => r.type === 'deal')
      .map((r) => r.dealId);
    expect(displayedDealIds).toHaveLength(50);
    displayedDealIds.forEach((id) => {
      expect(dealIds.has(id)).toBe(true);
    });

    const displayedActivityIds = result.mergedTimeline
      .filter((r) => r.type === 'activity')
      .map((r) => r.activityId);
    expect(displayedActivityIds).toHaveLength(49);
    displayedActivityIds.forEach((id) => {
      expect(activityIds.has(id)).toBe(true);
    });
  });
});