import { searchCustomersByNameWithPermission } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-489: [normal] 顧客レコード検索・権限制御機能 - 顧客名で部分一致検索したとき、該当する担当営業割り当て顧客が表示される
  test('顧客名で部分一致検索したとき、担当営業割り当て顧客のみが表示される', () => {
    const loggedInUserId = 'user_sales_A';
    const searchKeyword = '山田商事';

    const mockCustomerRecords = [
      {
        customerId: 'cust_001',
        customerName: '山田商事株式会社',
        assignedSalesUserId: 'user_sales_A',
      },
      {
        customerId: 'cust_002',
        customerName: '山田商事工業所',
        assignedSalesUserId: 'user_sales_A',
      },
      {
        customerId: 'cust_003',
        customerName: '山田商事東京営業所',
        assignedSalesUserId: 'user_sales_A',
      },
      {
        customerId: 'cust_004',
        customerName: '山田商事大阪支店',
        assignedSalesUserId: 'user_sales_B',
      },
      {
        customerId: 'cust_005',
        customerName: '田中工業',
        assignedSalesUserId: 'user_sales_A',
      },
    ];

    const result = searchCustomersByNameWithPermission(
      loggedInUserId,
      searchKeyword,
      mockCustomerRecords
    );

    expect(result).toEqual([
      {
        customerId: 'cust_001',
        customerName: '山田商事株式会社',
        assignedSalesUserId: 'user_sales_A',
      },
      {
        customerId: 'cust_002',
        customerName: '山田商事工業所',
        assignedSalesUserId: 'user_sales_A',
      },
      {
        customerId: 'cust_003',
        customerName: '山田商事東京営業所',
        assignedSalesUserId: 'user_sales_A',
      },
    ]);

    expect(result.length).toBe(3);
    expect(result.every(cust => cust.assignedSalesUserId === loggedInUserId)).toBe(
      true
    );
    expect(result.every(cust => cust.customerName.includes(searchKeyword))).toBe(
      true
    );
  });
});