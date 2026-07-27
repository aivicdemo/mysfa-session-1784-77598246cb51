import { searchCustomersByIdWithPermission } from "../../src/logic/it-1";

describe("顧客レコード検索・権限制御機能", () => {
  // SCEN-490
  test("顧客IDで検索したが、そのIDの顧客に担当営業が割り当てられていないとき、空の一覧が返される", () => {
    // 入力：顧客ID「CUST-001」、ただし担当営業なし
    const customerId = "CUST-001";
    const loggedInUserId = "USER-A";
    
    // テストデータ：顧客レコード（担当営業なし）
    const customerRecords = [
      {
        customer_id: "CUST-001",
        customer_name: "Test Customer",
        assigned_sales_user_id: null,
      },
    ];
    
    // 権限制御ロジック：ログインユーザーの担当顧客リスト
    const userAssignedCustomers = [
      { customer_id: "CUST-002", assigned_sales_user_id: "USER-A" },
      { customer_id: "CUST-003", assigned_sales_user_id: "USER-A" },
    ];
    
    // 実行
    const result = searchCustomersByIdWithPermission(
      customerId,
      loggedInUserId,
      customerRecords,
      userAssignedCustomers
    );
    
    // 期待値：空の一覧
    expect(result).toEqual([]);
  });
});