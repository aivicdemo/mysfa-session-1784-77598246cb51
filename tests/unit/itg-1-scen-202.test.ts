import { searchCustomersWithPermissionFilter } from "../../src/logic/it-1";

describe("顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能", () => {
  // SCEN-202
  test("権限情報が不正またはnullの場合にエラーが発生する", () => {
    const search_query = "test_customer";
    const invalid_permission_null = null;

    expect(() =>
      searchCustomersWithPermissionFilter(search_query, invalid_permission_null)
    ).toThrow(/権限情報/);
  });

  test("権限情報がundefinedの場合にエラーが発生する", () => {
    const search_query = "test_customer";
    const invalid_permission_undefined = undefined;

    expect(() =>
      searchCustomersWithPermissionFilter(
        search_query,
        invalid_permission_undefined
      )
    ).toThrow(/権限情報/);
  });

  test("権限情報が空文字列の場合にエラーが発生する", () => {
    const search_query = "test_customer";
    const invalid_permission_empty = "";

    expect(() =>
      searchCustomersWithPermissionFilter(search_query, invalid_permission_empty)
    ).toThrow(/権限情報/);
  });

  test("権限情報が不正なJSON形式の場合にエラーが発生する", () => {
    const search_query = "test_customer";
    const invalid_permission_malformed = "not_valid_json";

    expect(() =>
      searchCustomersWithPermissionFilter(
        search_query,
        invalid_permission_malformed
      )
    ).toThrow(/権限情報/);
  });

  test("正常な権限情報で検索が成功する", () => {
    const search_query = "customer_name";
    const valid_permission = JSON.stringify({
      user_id: "user_123",
      role: "sales_manager",
      assigned_customers: ["cust_001", "cust_002"],
    });

    const result = searchCustomersWithPermissionFilter(
      search_query,
      valid_permission
    );

    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);
    expect(Array.isArray(result.customers)).toBe(true);
  });

  test("権限情報が空のオブジェクトJSON文字列の場合にエラーが発生する", () => {
    const search_query = "test_customer";
    const invalid_permission_empty_object = "{}";

    expect(() =>
      searchCustomersWithPermissionFilter(
        search_query,
        invalid_permission_empty_object
      )
    ).toThrow(/権限情報/);
  });

  test("権限情報が必須フィールドを欠いている場合にエラーが発生する", () => {
    const search_query = "test_customer";
    const invalid_permission_missing_fields = JSON.stringify({
      user_id: "user_123",
    });

    expect(() =>
      searchCustomersWithPermissionFilter(
        search_query,
        invalid_permission_missing_fields
      )
    ).toThrow(/権限情報/);
  });
});