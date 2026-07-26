import { describe, test, expect, beforeEach } from "@jest/globals";
import {
  searchCustomersByPermission,
} from "../../src/logic/it-1";

describe("顧客レコード画面の権限ベースフィルタリング", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-200: 顧客検索時の権限ベースフィルタリング機能 - ログイン営業担当者に割り当てられた顧客のみが検索結果として表示される
  test("SCEN-200: 営業担当者Aでログイン時、割り当てられた顧客のみ検索結果に表示される", () => {
    const login_user_id = "user_001";
    const login_user_role = "sales";
    const assigned_customers_a = [
      {
        customer_id: "cust_101",
        customer_name: "顧客A社",
        assigned_user_id: "user_001",
      },
      {
        customer_id: "cust_102",
        customer_name: "顧客B社",
        assigned_user_id: "user_001",
      },
    ];
    const assigned_customers_b = [
      {
        customer_id: "cust_201",
        customer_name: "顧客C社",
        assigned_user_id: "user_002",
      },
    ];
    const unassigned_customer = {
      customer_id: "cust_301",
      customer_name: "顧客D社",
      assigned_user_id: null,
    };
    const all_customers = [
      ...assigned_customers_a,
      ...assigned_customers_b,
      unassigned_customer,
    ];

    const search_query = "";

    const result_user_a = searchCustomersByPermission(
      login_user_id,
      login_user_role,
      all_customers,
      search_query
    );

    expect(result_user_a).toHaveLength(2);
    expect(result_user_a[0].customer_id).toBe("cust_101");
    expect(result_user_a[0].customer_name).toBe("顧客A社");
    expect(result_user_a[1].customer_id).toBe("cust_102");
    expect(result_user_a[1].customer_name).toBe("顧客B社");
    expect(
      result_user_a.some((c) => c.customer_id === "cust_201")
    ).toBe(false);
    expect(
      result_user_a.some((c) => c.customer_id === "cust_301")
    ).toBe(false);
  });

  test("SCEN-200: 営業担当者Bでログイン時、割り当てられた顧客のみ検索結果に表示される", () => {
    const login_user_id = "user_002";
    const login_user_role = "sales";
    const assigned_customers_a = [
      {
        customer_id: "cust_101",
        customer_name: "顧客A社",
        assigned_user_id: "user_001",
      },
      {
        customer_id: "cust_102",
        customer_name: "顧客B社",
        assigned_user_id: "user_001",
      },
    ];
    const assigned_customers_b = [
      {
        customer_id: "cust_201",
        customer_name: "顧客C社",
        assigned_user_id: "user_002",
      },
    ];
    const unassigned_customer = {
      customer_id: "cust_301",
      customer_name: "顧客D社",
      assigned_user_id: null,
    };
    const all_customers = [
      ...assigned_customers_a,
      ...assigned_customers_b,
      unassigned_customer,
    ];

    const search_query = "";

    const result_user_b = searchCustomersByPermission(
      login_user_id,
      login_user_role,
      all_customers,
      search_query
    );

    expect(result_user_b).toHaveLength(1);
    expect(result_user_b[0].customer_id).toBe("cust_201");
    expect(result_user_b[0].customer_name).toBe("顧客C社");
    expect(
      result_user_b.some((c) => c.customer_id === "cust_101")
    ).toBe(false);
    expect(
      result_user_b.some((c) => c.customer_id === "cust_301")
    ).toBe(false);
  });

  test("SCEN-200: 管理者ロールでログイン時、全顧客が検索結果に表示される", () => {
    const login_user_id = "user_admin";
    const login_user_role = "admin";
    const assigned_customers_a = [
      {
        customer_id: "cust_101",
        customer_name: "顧客A社",
        assigned_user_id: "user_001",
      },
      {
        customer_id: "cust_102",
        customer_name: "顧客B社",
        assigned_user_id: "user_001",
      },
    ];
    const assigned_customers_b = [
      {
        customer_id: "cust_201",
        customer_name: "顧客C社",
        assigned_user_id: "user_002",
      },
    ];
    const unassigned_customer = {
      customer_id: "cust_301",
      customer_name: "顧客D社",
      assigned_user_id: null,
    };
    const all_customers = [
      ...assigned_customers_a,
      ...assigned_customers_b,
      unassigned_customer,
    ];

    const search_query = "";

    const result_admin = searchCustomersByPermission(
      login_user_id,
      login_user_role,
      all_customers,
      search_query
    );

    expect(result_admin).toHaveLength(4);
    expect(result_admin.map((c) => c.customer_id)).toEqual([
      "cust_101",
      "cust_102",
      "cust_201",
      "cust_301",
    ]);
  });

  test("SCEN-200: 営業担当者Aが部分一致検索を実行時、割り当てられた顧客の中から検索条件にマッチした顧客のみが表示される", () => {
    const login_user_id = "user_001";
    const login_user_role = "sales";
    const all_customers = [
      {
        customer_id: "cust_101",
        customer_name: "顧客A社",
        assigned_user_id: "user_001",
      },
      {
        customer_id: "cust_102",
        customer_name: "顧客B社",
        assigned_user_id: "user_001",
      },
      {
        customer_id: "cust_201",
        customer_name: "顧客C社",
        assigned_user_id: "user_002",
      },
      {
        customer_id: "cust_301",
        customer_name: "顧客D社",
        assigned_user_id: null,
      },
    ];

    const search_query = "A社";

    const result_filtered = searchCustomersByPermission(
      login_user_id,
      login_user_role,
      all_customers,
      search_query
    );

    expect(result_filtered).toHaveLength(1);
    expect(result_filtered[0].customer_id).toBe("cust_101");
    expect(result_filtered[0].customer_name).toBe("顧客A社");
  });

  test("SCEN-200: 営業担当者が顧客IDで検索実行時、割り当てられた顧客の中から検索条件にマッチした顧客のみが表示される", () => {
    const login_user_id = "user_001";
    const login_user_role = "sales";
    const all_customers = [
      {
        customer_id: "cust_101",
        customer_name: "顧客A社",
        assigned_user_id: "user_001",
      },
      {
        customer_id: "cust_102",
        customer_name: "顧客B社",
        assigned_user_id: "user_001",
      },
      {
        customer_id: "cust_201",
        customer_name: "顧客C社",
        assigned_user_id: "user_002",
      },
    ];

    const search_query = "cust_101";

    const result_by_id = searchCustomersByPermission(
      login_user_id,
      login_user_role,
      all_customers,
      search_query
    );

    expect(result_by_id).toHaveLength(1);
    expect(result_by_id[0].customer_id).toBe("cust_101");
  });

  test("SCEN-200: 営業担当者が他営業の顧客を検索しても検索結果に表示されない", () => {
    const login_user_id = "user_001";
    const login_user_role = "sales";
    const all_customers = [
      {
        customer_id: "cust_101",
        customer_name: "顧客A社",
        assigned_user_id: "user_001",
      },
      {
        customer_id: "cust_201",
        customer_name: "顧客C社",
        assigned_user_id: "user_002",
      },
    ];

    const search_query = "顧客C社";

    const result_not_assigned = searchCustomersByPermission(
      login_user_id,
      login_user_role,
      all_customers,
      search_query
    );

    expect(result_not_assigned).toHaveLength(0);
  });

  test("SCEN-200: ログイン営業担当者に割り当てられた顧客がない場合、空の検索結果が返される", () => {
    const login_user_id = "user_001";
    const login_user_role = "sales";
    const all_customers = [
      {
        customer_id: "cust_201",
        customer_name: "顧客C社",
        assigned_user_id: "user_002",
      },
      {
        customer_id: "cust_301",
        customer_name: "顧客D社",
        assigned_user_id: "user_003",
      },
    ];

    const search_query = "";

    const result_empty = searchCustomersByPermission(
      login_user_id,
      login_user_role,
      all_customers,
      search_query
    );

    expect(result_empty).toHaveLength(0);
  });

  test("SCEN-200: 管理者が汎用検索条件で全顧客を検索できる", () => {
    const login_user_id = "user_admin";
    const login_user_role = "admin";
    const all_customers = [
      {
        customer_id: "cust_101",
        customer_name: "顧客A社",
        assigned_user_id: "user_001",
      },
      {
        customer_id: "cust_102",
        customer_name: "顧客B社",
        assigned_user_id: "user_001",
      },
      {
        customer_id: "cust_201",
        customer_name: "顧客C社",
        assigned_user_id: "user_002",
      },
      {
        customer_id: "cust_301",
        customer_name: "顧客D社",
        assigned_user_id: null,
      },
    ];

    const search_query = "顧客";

    const result_admin_search = searchCustomersByPermission(
      login_user_id,
      login_user_role,
      all_customers,
      search_query
    );

    expect(result_admin_search).toHaveLength(4);
    expect(result_admin_search.map((c) => c.customer_id)).toEqual([
      "cust_101",
      "cust_102",
      "cust_201",
      "cust_301",
    ]);
  });
});