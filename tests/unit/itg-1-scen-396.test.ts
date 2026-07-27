import { fetchCustmerRecordHistoryAndActivities } from '../../src/logic/it-1';

describe('顧客レコード画面の過去商談履歴・活動記録の時系列表示機能', () => {
  // SCEN-396
  test('商談と活動記録が101件のとき、最新の100件のみが返される', () => {
    const customerId = 'CUST-001';
    const dealRecords = Array.from({ length: 50 }, (_, i) => ({
      id: `DEAL-${i + 1}`,
      customerId,
      type: 'deal',
      amount: 100000 + i * 10000,
      status: 'negotiation',
      timestamp: new Date(new Date('2024-01-01T00:00:00Z').getTime() + i * 60000).toISOString(),
    }));

    const activityRecords = Array.from({ length: 51 }, (_, i) => ({
      id: `ACT-${i + 1}`,
      customerId,
      type: 'email',
      description: `Activity ${i + 1}`,
      timestamp: new Date(new Date('2024-01-01T00:00:00Z').getTime() + (50 + i) * 60000).toISOString(),
    }));

    const allRecords = [...dealRecords, ...activityRecords];
    const sortedByTimestampAsc = allRecords.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const oldestRecordToExclude = sortedByTimestampAsc[0];
    const expectedRecords = sortedByTimestampAsc.slice(1);
    const sortedByTimestampDesc = expectedRecords.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const result = fetchCustmerRecordHistoryAndActivities(customerId, allRecords);

    expect(result).toHaveLength(100);
    expect(result.map((r) => r.id)).not.toContain(oldestRecordToExclude.id);

    for (let i = 0; i < result.length - 1; i++) {
      const currentTimestamp = new Date(result[i].timestamp).getTime();
      const nextTimestamp = new Date(result[i + 1].timestamp).getTime();
      expect(currentTimestamp).toBeGreaterThanOrEqual(nextTimestamp);
    }

    const returnedMostOldestTimestamp = new Date(result[result.length - 1].timestamp).getTime();
    const expectedMostOldestRecord = sortedByTimestampDesc[sortedByTimestampDesc.length - 1];
    const expectedMostOldestTimestamp = new Date(expectedMostOldestRecord.timestamp).getTime();
    expect(returnedMostOldestTimestamp).toBe(expectedMostOldestTimestamp);

    expect(result).toEqual(sortedByTimestampDesc);
  });
});