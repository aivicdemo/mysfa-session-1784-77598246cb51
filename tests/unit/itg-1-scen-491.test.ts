import { searchCustomers } from '../../src/logic/it-1';

describe('顧客レコード検索・権限制御機能', () => {
  test('SCEN-491: 顧客名で検索したが、その名前の顧客に担当営業が割り当てられていないとき、空の一覧が返される', () => {
    // Arrange
    const customerId = 'CUST-ABC-001';
    const customerName = 'ABC商事';
    const currentUserId = 'USER-SALES-001';
    const searchQuery = 'ABC商事';

    // テストデータベースに顧客レコード『ABC商事』を作成し、担当営業フィールドをNULLに設定
    const testCustomer = {
      id: customerId,
      name: customerName,
      assignedSalesRepId: null, // 担当営業が割り当てられていない
    };

    // 認証済みユーザー（一般営業権限）
    const authenticatedUser = {
      id: currentUserId,
      role: 'SALES_REP',
      permissions: ['view_customer_records'],
    };

    // 権限制御機能を持つモック（担当営業が割り当てられた顧客のみ表示）
    const customerDatabase = [testCustomer];

    // Act
    const searchResult = searchCustomers(
      searchQuery,
      authenticatedUser,
      customerDatabase
    );

    // Assert
    // 検索結果として空の顧客一覧が返される
    expect(searchResult).toEqual([]);
    expect(searchResult.length).toBe(0);
  });
});