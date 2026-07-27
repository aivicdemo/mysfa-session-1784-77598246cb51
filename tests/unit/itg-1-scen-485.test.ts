import { searchCustomersByAssignedSalesRep } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-485: [normal] 顧客レコード検索・権限制御機能 - 担当営業が複数の顧客を割り当てられているとき、全て表示される
  test('should return all assigned customers for logged-in sales representative without filter', () => {
    const logged_in_user_id = 'USER_001';
    const logged_in_user_name = '山田太郎';

    const customer_a = {
      customer_id: 'CUST_001',
      customer_name: '顧客A株式会社',
      assigned_sales_rep_id: logged_in_user_id,
      assigned_sales_rep_name: logged_in_user_name,
      industry: '製造業',
      prefecture: '東京都',
    };

    const customer_b = {
      customer_id: 'CUST_002',
      customer_name: '顧客B有限会社',
      assigned_sales_rep_id: logged_in_user_id,
      assigned_sales_rep_name: logged_in_user_name,
      industry: 'IT',
      prefecture: '神奈川県',
    };

    const customer_c = {
      customer_id: 'CUST_003',
      customer_name: '顧客C商事',
      assigned_sales_rep_id: logged_in_user_id,
      assigned_sales_rep_name: logged_in_user_name,
      industry: '商社',
      prefecture: '大阪府',
    };

    const other_sales_rep_customer = {
      customer_id: 'CUST_004',
      customer_name: '他営業担当顧客',
      assigned_sales_rep_id: 'USER_002',
      assigned_sales_rep_name: '佐藤次郎',
      industry: '金融',
      prefecture: '東京都',
    };

    const all_customers_in_system = [
      customer_a,
      customer_b,
      customer_c,
      other_sales_rep_customer,
    ];

    const search_params = {
      logged_in_user_id: logged_in_user_id,
      search_query: '',
      filter_by_assigned_rep: true,
    };

    const result = searchCustomersByAssignedSalesRep(
      search_params,
      all_customers_in_system
    );

    expect(result).toHaveLength(3);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          customer_id: 'CUST_001',
          customer_name: '顧客A株式会社',
          assigned_sales_rep_id: logged_in_user_id,
        }),
        expect.objectContaining({
          customer_id: 'CUST_002',
          customer_name: '顧客B有限会社',
          assigned_sales_rep_id: logged_in_user_id,
        }),
        expect.objectContaining({
          customer_id: 'CUST_003',
          customer_name: '顧客C商事',
          assigned_sales_rep_id: logged_in_user_id,
        }),
      ])
    );

    const other_rep_customer_found = result.some(
      (customer) => customer.customer_id === 'CUST_004'
    );
    expect(other_rep_customer_found).toBe(false);
  });
});