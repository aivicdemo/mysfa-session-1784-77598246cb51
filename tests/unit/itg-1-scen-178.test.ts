import { searchCustomerByName } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-178: [normal] 顧客レコード検索機能 - 顧客名で完全一致する顧客レコードが検索・抽出される
  test('顧客名で完全一致する顧客レコードが検索・抽出される', () => {
    const mockCustomers = [
      {
        customerId: 'C001',
        customerName: '山田太郎',
        contactPerson: '山田太郎',
        phoneNumber: '09012345678',
        email: 'yamada@example.com',
        industry: '製造業',
        establishedDate: '2010-01-15',
      },
      {
        customerId: 'C002',
        customerName: '山田太郎商事',
        contactPerson: '鈴木花子',
        phoneNumber: '09087654321',
        email: 'suzuki@example.com',
        industry: '商社',
        establishedDate: '2015-06-20',
      },
      {
        customerId: 'C003',
        customerName: '佐藤次郎',
        contactPerson: '佐藤次郎',
        phoneNumber: '09011111111',
        email: 'sato@example.com',
        industry: 'IT',
        establishedDate: '2012-03-10',
      },
    ];

    const searchKeyword = '山田太郎';
    const result = searchCustomerByName(mockCustomers, searchKeyword);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      customerId: 'C001',
      customerName: '山田太郎',
      contactPerson: '山田太郎',
      phoneNumber: '09012345678',
      email: 'yamada@example.com',
      industry: '製造業',
      establishedDate: '2010-01-15',
    });
    expect(result[0].customerId).toBe('C001');
    expect(result[0].customerName).toBe('山田太郎');
    expect(result[0].contactPerson).toBe('山田太郎');
    expect(result[0].phoneNumber).toBe('09012345678');
    expect(result[0].email).toBe('yamada@example.com');
  });
});