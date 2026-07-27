import { searchCustomerRecords } from '../../src/logic/it-1';

describe('顧客レコード検索・権限制御機能', () => {
  // SCEN-484
  test('検索キーワードがない状態で検索ボタンを押したとき、担当営業割り当てのない顧客は非表示になる', () => {
    const loggedInUserId = 'user-a-001';
    const searchKeyword = '';

    const mockCustomers = [
      {
        id: 'cust-001',
        name: '顧客A',
        assignedSalesUserId: 'user-a-001',
      },
      {
        id: 'cust-002',
        name: '顧客B',
        assignedSalesUserId: null,
      },
      {
        id: 'cust-003',
        name: '顧客C',
        assignedSalesUserId: 'user-a-001',
      },
      {
        id: 'cust-004',
        name: '顧客D',
        assignedSalesUserId: 'user-b-002',
      },
      {
        id: 'cust-005',
        name: '顧客E',
        assignedSalesUserId: '',
      },
    ];

    const result = searchCustomerRecords({
      loggedInUserId,
      searchKeyword,
      allCustomers: mockCustomers,
    });

    expect(result).toEqual([
      {
        id: 'cust-001',
        name: '顧客A',
        assignedSalesUserId: 'user-a-001',
      },
      {
        id: 'cust-003',
        name: '顧客C',
        assignedSalesUserId: 'user-a-001',
      },
    ]);

    expect(result.length).toBe(2);
  });
});