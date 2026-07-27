import { searchCustomers } from '../../src/logic/it-1';

describe('顧客レコード検索機能', () => {
  test('SCEN-370: 検索対象の顧客レコードが1件のみの場合、その1件が抽出される', () => {
    const mockCustomers = [
      {
        customerId: 'CUST001',
        customerName: 'テスト株式会社',
        email: 'test@example.com',
        industry: '製造業',
      },
    ];

    const searchQuery = 'テスト株式会社';

    const result = searchCustomers(mockCustomers, searchQuery);

    expect(result.customers).toHaveLength(1);
    expect(result.customers[0]).toEqual({
      customerId: 'CUST001',
      customerName: 'テスト株式会社',
      email: 'test@example.com',
      industry: '製造業',
    });
    expect(result.hitCount).toBe(1);
  });
});