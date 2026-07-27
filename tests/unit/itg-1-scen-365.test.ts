import { searchCustomers } from '../../src/logic/it-1';

describe('顧客検索機能 - 同一検索条件での結果一貫性', () => {
  // SCEN-365
  test('同じ検索条件で2回実行しても同じ結果が返される', () => {
    const preregisteredCustomers = [
      {
        customer_id: 'C001',
        customer_name: '株式会社テスト',
        industry: 'IT',
        region: '東京'
      }
    ];

    const search_condition = '顧客名に「テスト」を含む';
    const search_key = 'テスト';

    const first_search_result = searchCustomers({
      customers: preregisteredCustomers,
      search_key: search_key,
      search_type: 'customer_name'
    });

    const second_search_result = searchCustomers({
      customers: preregisteredCustomers,
      search_key: search_key,
      search_type: 'customer_name'
    });

    expect(first_search_result.length).toBe(1);
    expect(second_search_result.length).toBe(1);

    expect(first_search_result[0].customer_id).toBe('C001');
    expect(second_search_result[0].customer_id).toBe('C001');

    expect(first_search_result[0].customer_name).toBe('株式会社テスト');
    expect(second_search_result[0].customer_name).toBe('株式会社テスト');

    expect(first_search_result[0].industry).toBe('IT');
    expect(second_search_result[0].industry).toBe('IT');

    expect(first_search_result[0].region).toBe('東京');
    expect(second_search_result[0].region).toBe('東京');

    expect(first_search_result).toEqual(second_search_result);
  });
});