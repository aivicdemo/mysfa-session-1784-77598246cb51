import { searchCustomerRecords } from '../../src/logic/it-1';

describe('顧客レコード検索・権限制御機能', () => {
  // SCEN-482
  test('担当営業が割り当てられていない顧客を検索したとき、その顧客が非表示になる', () => {
    const loggedInUserId = 'user_001';
    const assignedCustomerIds = ['cust_101', 'cust_102'];
    
    const unassignedCustomerId = 'cust_999';
    const allCustomersInSystem = [
      { id: 'cust_101', name: '顧客A', assignedSalesUserId: 'user_001' },
      { id: 'cust_102', name: '顧客B', assignedSalesUserId: 'user_001' },
      { id: 'cust_999', name: '顧客C', assignedSalesUserId: 'user_002' },
    ];

    const searchParams = {
      userId: loggedInUserId,
      searchQuery: '',
      allCustomers: allCustomersInSystem,
    };

    const result = searchCustomerRecords(searchParams);

    expect(result.visibleCustomers).toHaveLength(2);
    expect(result.visibleCustomers.map((c) => c.id)).toEqual(['cust_101', 'cust_102']);
    expect(result.visibleCustomers.map((c) => c.id)).not.toContain(unassignedCustomerId);
    expect(result.hasAccessToCustomer(unassignedCustomerId)).toBe(false);
  });
});