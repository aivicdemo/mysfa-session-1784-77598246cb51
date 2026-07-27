import { searchCustomersByAssignedUser } from '../../src/logic/it-1';

describe('顧客レコード検索・権限制御機能', () => {
  // SCEN-481
  test('担当営業が割り当てられた顧客を検索したとき、該当顧客が表示される', () => {
    const userId_A = 'USER-A';
    const userId_B = 'USER-B';

    const customers = [
      {
        customerId: 'CUST-001',
        customerName: '山田商事',
        address: '東京都渋谷区',
        assignedUserId: userId_A,
      },
      {
        customerId: 'CUST-002',
        customerName: '佐藤工業',
        address: '東京都新宿区',
        assignedUserId: userId_B,
      },
      {
        customerId: 'CUST-003',
        customerName: '山田デジタル',
        address: '神奈川県横浜市',
        assignedUserId: userId_B,
      },
    ];

    const searchQuery = '山田商事';
    const loggedInUserId = userId_A;

    const result = searchCustomersByAssignedUser(
      customers,
      searchQuery,
      loggedInUserId
    );

    expect(result).toEqual([
      {
        customerId: 'CUST-001',
        customerName: '山田商事',
        address: '東京都渋谷区',
        assignedUserId: userId_A,
      },
    ]);
    expect(result).toHaveLength(1);
  });
});