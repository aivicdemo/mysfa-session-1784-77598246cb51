import { fetchCustomerHistoryRecords } from '../../src/logic/it-1';

describe('顧客レコード画面の過去商談履歴・活動記録の時系列表示機能', () => {
  // SCEN-408
  test('同じ入力で2回実行したとき、両回とも同じ結果が返される', async () => {
    const customerId = 'CUST-001';
    const expectedTimestamp1 = new Date('2024-01-20T10:30:00Z');
    const expectedTimestamp2 = new Date('2024-01-15T14:00:00Z');
    const expectedTimestamp3 = new Date('2024-01-10T09:15:00Z');

    const expectedFirstResult = {
      customerId: 'CUST-001',
      records: [
        {
          id: 'DEAL-003',
          type: 'deal',
          title: '商談A',
          timestamp: expectedTimestamp1,
          status: '交渉中',
          amount: 500000,
          owner: 'sales_user_001'
        },
        {
          id: 'ACTIVITY-002',
          type: 'activity',
          title: '顧客訪問',
          timestamp: expectedTimestamp2,
          activityType: 'visit',
          description: '顧客先で要件確認を実施',
          owner: 'sales_user_001'
        },
        {
          id: 'DEAL-001',
          type: 'deal',
          title: '商談B',
          timestamp: expectedTimestamp3,
          status: '受注',
          amount: 1000000,
          owner: 'sales_user_001'
        }
      ],
      totalCount: 3,
      displayedCount: 3
    };

    const firstResult = await fetchCustomerHistoryRecords(customerId);
    expect(firstResult).toEqual(expectedFirstResult);

    const secondResult = await fetchCustomerHistoryRecords(customerId);
    expect(secondResult).toEqual(expectedFirstResult);

    expect(firstResult.customerId).toBe(secondResult.customerId);
    expect(firstResult.totalCount).toBe(secondResult.totalCount);
    expect(firstResult.displayedCount).toBe(secondResult.displayedCount);

    expect(firstResult.records.length).toBe(secondResult.records.length);

    firstResult.records.forEach((record, index) => {
      expect(record.id).toBe(secondResult.records[index].id);
      expect(record.type).toBe(secondResult.records[index].type);
      expect(record.title).toBe(secondResult.records[index].title);
      expect(record.timestamp).toEqual(secondResult.records[index].timestamp);
    });
  });
});