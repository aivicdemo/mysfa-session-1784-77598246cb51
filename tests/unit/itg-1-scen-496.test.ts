import { searchCustomers } from '../../src/logic/it-1';

describe('顧客レコード検索・権限制御機能', () => {
  // SCEN-496
  test('検索キーワードに特殊文字を含むとき、該当する顧客が正確に検索される', () => {
    const logged_in_user_id = 'user_001';
    const logged_in_user_assigned_customer_ids = [
      'cust_001',
      'cust_002',
      'cust_003',
      'cust_004',
      'cust_005',
    ];

    const mock_customers_in_db = [
      {
        customer_id: 'cust_001',
        customer_name: '株式会社A&B（東京）',
        address: '東京都渋谷区1-1-1',
        phone: '03-0000-0001',
        email: 'contact@aandb-tokyo.com',
        assigned_user_id: logged_in_user_id,
      },
      {
        customer_id: 'cust_002',
        customer_name: 'O\'Reilly企業',
        address: '東京都千代田区2-2-2',
        phone: '03-0000-0002',
        email: 'info@oreilly-jp.com',
        assigned_user_id: logged_in_user_id,
      },
      {
        customer_id: 'cust_003',
        customer_name: '顧客*2024@test',
        address: '大阪府北区3-3-3',
        phone: '06-0000-0003',
        email: 'admin@customer2024test.com',
        assigned_user_id: logged_in_user_id,
      },
      {
        customer_id: 'cust_004',
        customer_name: '株式会社A&B（大阪）',
        address: '大阪府北区4-4-4',
        phone: '06-0000-0004',
        email: 'contact@aandb-osaka.com',
        assigned_user_id: 'user_002',
      },
      {
        customer_id: 'cust_005',
        customer_name: 'テスト企業',
        address: '名古屋市中区5-5-5',
        phone: '052-0000-0005',
        email: 'test@company.com',
        assigned_user_id: logged_in_user_id,
      },
    ];

    const search_keyword_with_special_chars_1 = '株式会社A&B（東京）';
    const result_1 = searchCustomers(
      search_keyword_with_special_chars_1,
      logged_in_user_id,
      logged_in_user_assigned_customer_ids,
      mock_customers_in_db
    );

    expect(result_1).toHaveLength(1);
    expect(result_1[0]).toEqual({
      customer_id: 'cust_001',
      customer_name: '株式会社A&B（東京）',
      address: '東京都渋谷区1-1-1',
      phone: '03-0000-0001',
      email: 'contact@aandb-tokyo.com',
    });

    const search_keyword_with_special_chars_2 = "O'Reilly企業";
    const result_2 = searchCustomers(
      search_keyword_with_special_chars_2,
      logged_in_user_id,
      logged_in_user_assigned_customer_ids,
      mock_customers_in_db
    );

    expect(result_2).toHaveLength(1);
    expect(result_2[0]).toEqual({
      customer_id: 'cust_002',
      customer_name: "O'Reilly企業",
      address: '東京都千代田区2-2-2',
      phone: '03-0000-0002',
      email: 'info@oreilly-jp.com',
    });

    const search_keyword_with_special_chars_3 = '顧客*2024@test';
    const result_3 = searchCustomers(
      search_keyword_with_special_chars_3,
      logged_in_user_id,
      logged_in_user_assigned_customer_ids,
      mock_customers_in_db
    );

    expect(result_3).toHaveLength(1);
    expect(result_3[0]).toEqual({
      customer_id: 'cust_003',
      customer_name: '顧客*2024@test',
      address: '大阪府北区3-3-3',
      phone: '06-0000-0003',
      email: 'admin@customer2024test.com',
    });

    const search_keyword_similar_without_special_chars = 'A&B';
    const result_similar = searchCustomers(
      search_keyword_similar_without_special_chars,
      logged_in_user_id,
      logged_in_user_assigned_customer_ids,
      mock_customers_in_db
    );

    expect(result_similar).toHaveLength(1);
    expect(result_similar[0].customer_id).toBe('cust_001');

    const other_user_id = 'user_002';
    const other_user_assigned_customer_ids = ['cust_004'];

    const result_with_permission_check = searchCustomers(
      '株式会社A&B（東京）',
      other_user_id,
      other_user_assigned_customer_ids,
      mock_customers_in_db
    );

    expect(result_with_permission_check).toHaveLength(0);

    const result_within_permission = searchCustomers(
      '株式会社A&B（大阪）',
      other_user_id,
      other_user_assigned_customer_ids,
      mock_customers_in_db
    );

    expect(result_within_permission).toHaveLength(1);
    expect(result_within_permission[0]).toEqual({
      customer_id: 'cust_004',
      customer_name: '株式会社A&B（大阪）',
      address: '大阪府北区4-4-4',
      phone: '06-0000-0004',
      email: 'contact@aandb-osaka.com',
    });
  });
});