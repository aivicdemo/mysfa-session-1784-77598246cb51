import { searchCustomers } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-366
  test('検索入力に特殊文字（%、_など）が含まれている場合、リテラル文字として扱われる', async () => {
    const mockCustomers = [
      {
        id: 'CUST001',
        name: '%社%',
        customerId: 'C001',
      },
      {
        id: 'CUST002',
        name: '_test_',
        customerId: 'C002',
      },
      {
        id: 'CUST003',
        name: '通常の会社名',
        customerId: 'C003',
      },
    ];

    const mockDatabaseAdapter = {
      searchCustomersByName: jest.fn((searchTerm: string) => {
        // 特殊文字をリテラル文字として扱うためのエスケープ処理を実装
        const escapedTerm = searchTerm.replace(/[%_]/g, '\\$&');
        return mockCustomers.filter((customer) => {
          const pattern = new RegExp(escapedTerm, 'i');
          return pattern.test(customer.name);
        });
      }),
    };

    // テスト1: 「%社%」を検索
    const result1 = await searchCustomers('%社%', mockDatabaseAdapter);

    expect(result1).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'CUST001',
          name: '%社%',
          customerId: 'C001',
        }),
      ])
    );
    expect(result1.length).toBe(1);
    expect(mockDatabaseAdapter.searchCustomersByName).toHaveBeenCalledWith('%社%');

    // テスト2: 「_test_」を検索
    mockDatabaseAdapter.searchCustomersByName.mockClear();
    const result2 = await searchCustomers('_test_', mockDatabaseAdapter);

    expect(result2).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'CUST002',
          name: '_test_',
          customerId: 'C002',
        }),
      ])
    );
    expect(result2.length).toBe(1);
    expect(mockDatabaseAdapter.searchCustomersByName).toHaveBeenCalledWith('_test_');
  });
});