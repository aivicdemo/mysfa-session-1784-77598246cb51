import { searchCustomerRecords } from '../../src/logic/it-1';

describe('顧客レコード検索・権限制御機能', () => {
  // SCEN-497: [edge] 検索結果が100件のとき、全件が返される
  test('should return all 100 customer records with pagination info and permission filtering', async () => {
    const authenticatedUserId = 'user_001';
    const userPermittedCustomerIds = Array.from({ length: 100 }, (_, i) => `cust_${String(i + 1).padStart(3, '0')}`);
    const userRestrictedCustomerIds = Array.from({ length: 50 }, (_, i) => `cust_restricted_${String(i + 1).padStart(3, '0')}`);

    const searchCondition = {
      region: 'KANTO',
      industry: 'MANUFACTURING',
      salesRangeMin: 10000000,
      salesRangeMax: 100000000,
    };

    const mockCustomerDatabase = [
      ...userPermittedCustomerIds.map((id, index) => ({
        customerId: id,
        customerName: `Customer ${index + 1}`,
        region: 'KANTO',
        industry: 'MANUFACTURING',
        annualSales: 50000000,
        assignedUserId: authenticatedUserId,
      })),
      ...userRestrictedCustomerIds.map((id, index) => ({
        customerId: id,
        customerName: `Restricted Customer ${index + 1}`,
        region: 'KANTO',
        industry: 'MANUFACTURING',
        annualSales: 50000000,
        assignedUserId: `user_other_${index + 1}`,
      })),
    ];

    const searchResult = await searchCustomerRecords({
      userId: authenticatedUserId,
      searchCondition: searchCondition,
      mockDatabase: mockCustomerDatabase,
    });

    expect(searchResult.records.length).toBe(100);
    expect(searchResult.totalCount).toBe(100);
    expect(searchResult.pageInfo.currentPage).toBe(1);
    expect(searchResult.pageInfo.pageSize).toBe(100);
    expect(searchResult.pageInfo.totalPages).toBe(1);
    expect(searchResult.pageInfo.displayText).toBe('100件中100件');

    const allRecordsHaveCorrectAssignment = searchResult.records.every(
      (record) => record.assignedUserId === authenticatedUserId
    );
    expect(allRecordsHaveCorrectAssignment).toBe(true);

    const lastRecord = searchResult.records[99];
    expect(lastRecord).toBeDefined();
    expect(lastRecord.customerId).toBe('cust_100');
    expect(lastRecord.customerName).toBe('Customer 100');
    expect(lastRecord.assignedUserId).toBe(authenticatedUserId);

    const restrictedIdsInResults = searchResult.records
      .map((r) => r.customerId)
      .filter((id) => userRestrictedCustomerIds.includes(id));
    expect(restrictedIdsInResults.length).toBe(0);
  });
});