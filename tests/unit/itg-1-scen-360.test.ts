import { searchCustomers } from '../../src/logic/it-1';

describe('顧客レコード画面の過去商談履歴・活動記録・課題解決状況の時系列表示機能', () => {
  // SCEN-360
  test('顧客IDのみで検索された場合、顧客名は検索条件に含まれない', () => {
    // Arrange: テスト用の顧客データベースを準備
    const testCustomerDatabase = [
      {
        customerId: 'CUST-001',
        customerName: '山田商事',
        address: '東京都渋谷区',
      },
      {
        customerId: 'CUST-002',
        customerName: '山田太郎',
        address: '大阪府大阪市',
      },
    ];

    // Act: 顧客IDのみを検索条件として検索を実行
    const searchCondition = {
      customerId: 'CUST-001',
      customerName: '', // 顧客名フィールドは空のまま（未入力）
    };
    const searchResult = searchCustomers(searchCondition, testCustomerDatabase);

    // Assert: 検索結果の検証
    expect(searchResult).toHaveLength(1);
    expect(searchResult[0]).toEqual({
      customerId: 'CUST-001',
      customerName: '山田商事',
      address: '東京都渋谷区',
    });
  });
});