import { searchCustomerRecords } from '../../src/logic/it-1';

describe('顧客レコード検索・権限制御機能', () => {
  // SCEN-495
  test('検索キーワードが空文字のとき、担当営業割り当てのある顧客全件が返される', async () => {
    const mockDatabase = [
      {
        customerId: 'CUST-001',
        customerName: '顧客A',
        assignedSalesRepId: 'SALES-001',
        assignedSalesRepName: '営業担当者1',
      },
      {
        customerId: 'CUST-002',
        customerName: '顧客B',
        assignedSalesRepId: 'SALES-002',
        assignedSalesRepName: '営業担当者2',
      },
      {
        customerId: 'CUST-003',
        customerName: '顧客C',
        assignedSalesRepId: 'SALES-003',
        assignedSalesRepName: '営業担当者3',
      },
      {
        customerId: 'CUST-004',
        customerName: '顧客D',
        assignedSalesRepId: 'SALES-004',
        assignedSalesRepName: '営業担当者4',
      },
      {
        customerId: 'CUST-005',
        customerName: '顧客E',
        assignedSalesRepId: 'SALES-005',
        assignedSalesRepName: '営業担当者5',
      },
      {
        customerId: 'CUST-006',
        customerName: '顧客F',
        assignedSalesRepId: null,
        assignedSalesRepName: null,
      },
      {
        customerId: 'CUST-007',
        customerName: '顧客G',
        assignedSalesRepId: null,
        assignedSalesRepName: null,
      },
      {
        customerId: 'CUST-008',
        customerName: '顧客H',
        assignedSalesRepId: null,
        assignedSalesRepName: null,
      },
    ];

    const mockPermissionChecker = {
      canReadCustomer: () => true,
    };

    const result = await searchCustomerRecords(
      '',
      mockDatabase,
      mockPermissionChecker,
    );

    expect(result).toHaveLength(5);
    expect(result[0].customerId).toBe('CUST-001');
    expect(result[0].customerName).toBe('顧客A');
    expect(result[0].assignedSalesRepName).toBe('営業担当者1');
    expect(result[1].customerId).toBe('CUST-002');
    expect(result[1].customerName).toBe('顧客B');
    expect(result[1].assignedSalesRepName).toBe('営業担当者2');
    expect(result[2].customerId).toBe('CUST-003');
    expect(result[2].customerName).toBe('顧客C');
    expect(result[2].assignedSalesRepName).toBe('営業担当者3');
    expect(result[3].customerId).toBe('CUST-004');
    expect(result[3].customerName).toBe('顧客D');
    expect(result[3].assignedSalesRepName).toBe('営業担当者4');
    expect(result[4].customerId).toBe('CUST-005');
    expect(result[4].customerName).toBe('顧客E');
    expect(result[4].assignedSalesRepName).toBe('営業担当者5');

    const unassignedCustomerIds = result.map((r) => r.customerId);
    expect(unassignedCustomerIds).not.toContain('CUST-006');
    expect(unassignedCustomerIds).not.toContain('CUST-007');
    expect(unassignedCustomerIds).not.toContain('CUST-008');
  });
});