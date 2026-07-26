import { filterCustomersByAssignedSalesUser } from "../../src/logic/it-1";

describe("顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能", () => {
  // SCEN-162
  test("[normal] 営業権限による顧客検索フィルタリング機能 - 担当営業が割り当てられた顧客のみが検索結果に表示される", () => {
    // Arrange: 営業ユーザーAと営業ユーザーBのセットアップ
    const user_a_id = "USR001";
    const user_b_id = "USR002";

    const customer_all: Array<{
      customer_id: string;
      customer_name: string;
      assigned_sales_user_id: string;
    }> = [
      {
        customer_id: "CUST001",
        customer_name: "顧客A社",
        assigned_sales_user_id: "USR001",
      },
      {
        customer_id: "CUST002",
        customer_name: "顧客B社",
        assigned_sales_user_id: "USR001",
      },
      {
        customer_id: "CUST003",
        customer_name: "顧客C社",
        assigned_sales_user_id: "USR002",
      },
      {
        customer_id: "CUST004",
        customer_name: "顧客D社",
        assigned_sales_user_id: "USR002",
      },
      {
        customer_id: "CUST005",
        customer_name: "顧客E社",
        assigned_sales_user_id: "USR003",
      },
    ];

    // Act: ユーザーAで顧客検索フィルタリングを実行
    const result_user_a = filterCustomersByAssignedSalesUser(
      customer_all,
      user_a_id
    );

    // Assert: ユーザーAには自分に割り当てられた顧客のみが返される
    expect(result_user_a.length).toBe(2);
    expect(result_user_a[0].customer_id).toBe("CUST001");
    expect(result_user_a[0].assigned_sales_user_id).toBe("USR001");
    expect(result_user_a[1].customer_id).toBe("CUST002");
    expect(result_user_a[1].assigned_sales_user_id).toBe("USR001");

    // Act: ユーザーBで顧客検索フィルタリングを実行
    const result_user_b = filterCustomersByAssignedSalesUser(
      customer_all,
      user_b_id
    );

    // Assert: ユーザーBには自分に割り当てられた顧客のみが返される
    expect(result_user_b.length).toBe(2);
    expect(result_user_b[0].customer_id).toBe("CUST003");
    expect(result_user_b[0].assigned_sales_user_id).toBe("USR002");
    expect(result_user_b[1].customer_id).toBe("CUST004");
    expect(result_user_b[1].assigned_sales_user_id).toBe("USR002");

    // Assert: ユーザーAとユーザーBの検索結果が異なることを確認
    expect(result_user_a).not.toEqual(result_user_b);
    expect(result_user_a.map((c) => c.customer_id)).not.toContain("CUST003");
    expect(result_user_a.map((c) => c.customer_id)).not.toContain("CUST004");
    expect(result_user_b.map((c) => c.customer_id)).not.toContain("CUST001");
    expect(result_user_b.map((c) => c.customer_id)).not.toContain("CUST002");

    // Assert: 割り当てられていない顧客はどちらのユーザーにも表示されない
    const all_returned_customer_ids = [
      ...result_user_a.map((c) => c.customer_id),
      ...result_user_b.map((c) => c.customer_id),
    ];
    expect(all_returned_customer_ids).not.toContain("CUST005");
  });
});