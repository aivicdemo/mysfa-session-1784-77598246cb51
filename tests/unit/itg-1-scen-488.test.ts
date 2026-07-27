import { searchCustomersByPartialId } from '../../src/logic/it-1';

describe('顧客レコード検索・権限制御機能', () => {
  // SCEN-488
  test('顧客IDで部分一致検索したとき、該当する担当営業割り当て顧客が表示される', () => {
    const current_user_id = 'USER-A';
    const search_query = 'CUST-00';

    const mock_customers = [
      {
        customer_id: 'CUST-001',
        customer_name: '○○株式会社',
        assigned_sales_user_id: 'USER-A',
      },
      {
        customer_id: 'CUST-002',
        customer_name: '××株式会社',
        assigned_sales_user_id: 'USER-B',
      },
      {
        customer_id: 'CUST-003',
        customer_name: '□□株式会社',
        assigned_sales_user_id: 'USER-A',
      },
    ];

    const result = searchCustomersByPartialId(
      current_user_id,
      search_query,
      mock_customers
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      customer_id: 'CUST-001',
      customer_name: '○○株式会社',
      assigned_sales_user_id: 'USER-A',
    });
  });
});