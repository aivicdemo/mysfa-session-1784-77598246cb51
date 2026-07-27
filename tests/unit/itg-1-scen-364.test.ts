import { searchCustomers } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-364
  test('顧客検索機能 - 検索結果に重複する顧客レコードが含まれない', () => {
    const test_customers = [
      {
        customer_id: '1001',
        customer_name: '山田太郎',
        email: 'yamada@example.com',
      },
      {
        customer_id: '1002',
        customer_name: '鈴木花子',
        email: 'suzuki@example.com',
      },
      {
        customer_id: '1003',
        customer_name: '山田太郎',
        email: 'yamada.2@example.com',
      },
    ];

    const search_query = '山田太郎';
    const result = searchCustomers(test_customers, search_query);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      customer_id: '1001',
      customer_name: '山田太郎',
      email: 'yamada@example.com',
    });
    expect(result[1]).toEqual({
      customer_id: '1003',
      customer_name: '山田太郎',
      email: 'yamada.2@example.com',
    });

    const customer_ids = result.map((customer) => customer.customer_id);
    const unique_ids = new Set(customer_ids);
    expect(unique_ids.size).toBe(customer_ids.length);
  });
});