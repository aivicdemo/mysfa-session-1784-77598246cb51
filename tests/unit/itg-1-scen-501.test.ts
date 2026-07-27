import { searchCustomerRecordsWithPermission } from "../../src/logic/it-1";

describe("顧客レコード検索・権限制御機能", () => {
  // SCEN-501
  test("担当営業割り当てデータが重複して存在するとき、顧客は1件だけ表示される", () => {
    // テストデータ準備：顧客レコード
    const customerRecord = {
      customerId: "CUST-001",
      customerName: "山田商事",
      industryType: "製造業",
      establishedDate: "2010-05-15",
    };

    // 担当営業割り当てデータ（複数件）
    const salesAssignments = [
      {
        assignmentId: "ASSIGN-001",
        customerId: "CUST-001",
        salesUserId: "SALES-001",
        assignedDate: "2024-01-10T09:00:00Z",
      },
      {
        assignmentId: "ASSIGN-002",
        customerId: "CUST-001",
        salesUserId: "SALES-002",
        assignedDate: "2024-01-15T10:30:00Z",
      },
    ];

    // ログインユーザー（営業A）の認証情報
    const loginUserContext = {
      userId: "SALES-001",
      userName: "営業太郎",
      role: "sales_representative",
      permissions: ["view_assigned_customers"],
    };

    // 検索条件
    const searchQuery = {
      keyword: "山田",
      searchType: "customer_name",
    };

    // 検索・権限制御機能を実行
    const searchResult = searchCustomerRecordsWithPermission(
      searchQuery,
      loginUserContext,
      {
        customers: [customerRecord],
        assignments: salesAssignments,
      }
    );

    // 期待結果：顧客レコードが正確に1件だけ表示される
    expect(searchResult).toEqual({
      customers: [
        {
          customerId: "CUST-001",
          customerName: "山田商事",
          industryType: "製造業",
          establishedDate: "2010-05-15",
        },
      ],
      totalCount: 1,
      hasMoreResults: false,
    });

    // 顧客レコード件数が1件であることを明示的に検証
    expect(searchResult.customers.length).toBe(1);
    expect(searchResult.totalCount).toBe(1);
  });
});