import { searchCustomersWithPermission } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-201
  test('[normal] 顧客検索時の権限ベースフィルタリング機能 - 他営業の顧客レコードは権限チェックにより非表示となる', () => {
    // 顧客マスタ
    const customersInSystem = [
      {
        customer_id: 'CUST001',
        customer_name: '顧客A社',
        assigned_sales_user_id: 'USER_A',
      },
      {
        customer_id: 'CUST002',
        customer_name: '顧客B社',
        assigned_sales_user_id: 'USER_A',
      },
      {
        customer_id: 'CUST003',
        customer_name: '顧客C社',
        assigned_sales_user_id: 'USER_B',
      },
      {
        customer_id: 'CUST004',
        customer_name: '顧客D社',
        assigned_sales_user_id: 'USER_B',
      },
    ];

    // ユーザーA（営業権限）が顧客検索を実行
    const user_a_id = 'USER_A';
    const search_query_user_a = '';

    const result_user_a = searchCustomersWithPermission(
      customersInSystem,
      user_a_id,
      search_query_user_a,
    );

    // ユーザーAには自身の担当顧客（CUST001, CUST002）のみ表示
    expect(result_user_a).toHaveLength(2);
    expect(result_user_a).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          customer_id: 'CUST001',
          customer_name: '顧客A社',
          assigned_sales_user_id: 'USER_A',
        }),
        expect.objectContaining({
          customer_id: 'CUST002',
          customer_name: '顧客B社',
          assigned_sales_user_id: 'USER_A',
        }),
      ]),
    );

    // ユーザーB（営業権限）が顧客検索を実行
    const user_b_id = 'USER_B';
    const search_query_user_b = '';

    const result_user_b = searchCustomersWithPermission(
      customersInSystem,
      user_b_id,
      search_query_user_b,
    );

    // ユーザーBには自身の担当顧客（CUST003, CUST004）のみ表示
    expect(result_user_b).toHaveLength(2);
    expect(result_user_b).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          customer_id: 'CUST003',
          customer_name: '顧客C社',
          assigned_sales_user_id: 'USER_B',
        }),
        expect.objectContaining({
          customer_id: 'CUST004',
          customer_name: '顧客D社',
          assigned_sales_user_id: 'USER_B',
        }),
      ]),
    );

    // ユーザーAの検索結果とユーザーBの検索結果が異なることを確認
    expect(result_user_a).not.toEqual(result_user_b);

    // ユーザーAの結果にはユーザーBの顧客が含まれていない
    const user_a_customer_ids = result_user_a.map((c) => c.customer_id);
    expect(user_a_customer_ids).not.toContain('CUST003');
    expect(user_a_customer_ids).not.toContain('CUST004');

    // ユーザーBの結果にはユーザーAの顧客が含まれていない
    const user_b_customer_ids = result_user_b.map((c) => c.customer_id);
    expect(user_b_customer_ids).not.toContain('CUST001');
    expect(user_b_customer_ids).not.toContain('CUST002');
  });
});