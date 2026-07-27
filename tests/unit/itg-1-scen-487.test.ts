import { searchCustomersByNameOrId } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-487: [edge] 顧客レコード検索・権限制御機能 - 検索結果が1件のとき、その1件が返される
  test('検索結果が1件のとき、その1件が返される', async () => {
    const testUserId = 'USER-001';
    const testCustomerId = 'CUST-001';
    const testCustomerName = 'テスト顧客A';
    const testCustomerEmail = 'test@example.com';

    const mockCustomerRecord = {
      customerId: testCustomerId,
      customerName: testCustomerName,
      emailAddress: testCustomerEmail,
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z'),
    };

    const mockPermission = {
      userId: testUserId,
      customerId: testCustomerId,
      hasAccess: true,
      canViewAllFields: true,
    };

    const mockDataSource = {
      findCustomersByNameOrId: jest.fn().mockResolvedValue([mockCustomerRecord]),
      getUserPermission: jest.fn().mockResolvedValue(mockPermission),
    };

    const searchCondition = {
      searchQuery: 'テスト顧客A',
      userId: testUserId,
    };

    const result = await searchCustomersByNameOrId(searchCondition, mockDataSource);

    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      customerId: testCustomerId,
      customerName: testCustomerName,
      emailAddress: testCustomerEmail,
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z'),
    });
    expect(mockDataSource.findCustomersByNameOrId).toHaveBeenCalledWith('テスト顧客A');
    expect(mockDataSource.getUserPermission).toHaveBeenCalledWith(testUserId, testCustomerId);
  });
});