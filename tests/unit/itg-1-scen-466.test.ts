import { fetchDealActivityRecords } from '../../src/logic/it-1';

describe('顧客レコード画面の商談履歴・活動記録表示', () => {
  test('SCEN-466: 同じ入力条件で2回実行したとき、同じ結果が返される', () => {
    const customerId = 'CUST-001';
    const filterCondition = {
      startDate: new Date('2024-01-01T00:00:00Z'),
      endDate: new Date('2024-12-31T23:59:59Z'),
      activityTypeFilter: 'all',
      sortOrder: 'descending'
    };

    const firstResult = fetchDealActivityRecords(customerId, filterCondition);
    const secondResult = fetchDealActivityRecords(customerId, filterCondition);

    expect(firstResult.records.length).toBe(secondResult.records.length);
    expect(firstResult.records).toEqual(secondResult.records);
    expect(firstResult.records[0]?.dealId).toBe(secondResult.records[0]?.dealId);
    expect(firstResult.records[0]?.activityType).toBe(secondResult.records[0]?.activityType);
    expect(firstResult.records[0]?.executedAt).toBe(secondResult.records[0]?.executedAt);
    expect(firstResult.records[0]?.assignedTo).toBe(secondResult.records[0]?.assignedTo);
    expect(firstResult.records[0]?.remarks).toBe(secondResult.records[0]?.remarks);
  });
});