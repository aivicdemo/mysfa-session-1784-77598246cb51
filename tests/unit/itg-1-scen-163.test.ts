import { filterCustomersByAssignedSalesRep } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-163
  test('営業権限による顧客検索フィルタリング機能 - 他営業の顧客レコードが検索結果から除外される', () => {
    // 営業ユーザーA のセットアップ
    const salesRepA_id = 'sales_rep_a_001';
    const salesRepA_name = 'User A';

    // 営業ユーザーB のセットアップ
    const salesRepB_id = 'sales_rep_b_001';
    const salesRepB_name = 'User B';

    // 全顧客マスタデータ
    const all_customers = [
      {
        customer_id: 'cust_001',
        customer_name: 'Company Alpha',
        assigned_sales_rep_id: salesRepA_id,
      },
      {
        customer_id: 'cust_002',
        customer_name: 'Company Beta',
        assigned_sales_rep_id: salesRepB_id,
      },
      {
        customer_id: 'cust_003',
        customer_name: 'Company Gamma',
        assigned_sales_rep_id: salesRepA_id,
      },
      {
        customer_id: 'cust_004',
        customer_name: 'Company Delta',
        assigned_sales_rep_id: salesRepB_id,
      },
      {
        customer_id: 'cust_005',
        customer_name: 'Company Epsilon',
        assigned_sales_rep_id: salesRepA_id,
      },
    ];

    // ユーザーA が全顧客検索を実行
    const filteredCustomers_repA = filterCustomersByAssignedSalesRep(
      all_customers,
      salesRepA_id
    );

    // ユーザーA の検索結果検証
    expect(filteredCustomers_repA).toEqual([
      {
        customer_id: 'cust_001',
        customer_name: 'Company Alpha',
        assigned_sales_rep_id: salesRepA_id,
      },
      {
        customer_id: 'cust_003',
        customer_name: 'Company Gamma',
        assigned_sales_rep_id: salesRepA_id,
      },
      {
        customer_id: 'cust_005',
        customer_name: 'Company Epsilon',
        assigned_sales_rep_id: salesRepA_id,
      },
    ]);

    // ユーザーA の検索結果に含まれる顧客数を確認
    expect(filteredCustomers_repA.length).toBe(3);

    // ユーザーA の検索結果に sales_rep_b が含まれていないことを確認
    const repA_rep_ids = filteredCustomers_repA.map(
      (c) => c.assigned_sales_rep_id
    );
    expect(repA_rep_ids).not.toContain(salesRepB_id);

    // ユーザーB が全顧客検索を実行
    const filteredCustomers_repB = filterCustomersByAssignedSalesRep(
      all_customers,
      salesRepB_id
    );

    // ユーザーB の検索結果検証
    expect(filteredCustomers_repB).toEqual([
      {
        customer_id: 'cust_002',
        customer_name: 'Company Beta',
        assigned_sales_rep_id: salesRepB_id,
      },
      {
        customer_id: 'cust_004',
        customer_name: 'Company Delta',
        assigned_sales_rep_id: salesRepB_id,
      },
    ]);

    // ユーザーB の検索結果に含まれる顧客数を確認
    expect(filteredCustomers_repB.length).toBe(2);

    // ユーザーB の検索結果に sales_rep_a が含まれていないことを確認
    const repB_rep_ids = filteredCustomers_repB.map(
      (c) => c.assigned_sales_rep_id
    );
    expect(repB_rep_ids).not.toContain(salesRepA_id);

    // ユーザーA とユーザーB の検索結果が異なることを確認
    expect(filteredCustomers_repA).not.toEqual(filteredCustomers_repB);

    // ユーザーA の検索結果に含まれる顧客 ID 一覧
    const repA_customer_ids = filteredCustomers_repA.map((c) => c.customer_id);
    expect(repA_customer_ids).toEqual(['cust_001', 'cust_003', 'cust_005']);

    // ユーザーB の検索結果に含まれる顧客 ID 一覧
    const repB_customer_ids = filteredCustomers_repB.map((c) => c.customer_id);
    expect(repB_customer_ids).toEqual(['cust_002', 'cust_004']);
  });
});