import { describe, test, expect, beforeEach } from "@jest/globals";
import { searchCustomerRecordsByPermission } from "../../src/logic/it-1";

describe("顧客レコード検索・権限制御機能", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-483
  test("検索キーワードがない状態で検索ボタンを押したとき、担当営業割り当てのある顧客が全件表示される", () => {
    const currentUserId = "user_sales_001";
    const searchKeyword = "";

    const testCustomers = [
      {
        customer_id: "cust_001",
        customer_name: "ABC Corporation",
        assigned_sales_user_id: "user_sales_001",
        created_date: "2024-01-10T09:00:00Z",
      },
      {
        customer_id: "cust_002",
        customer_name: "XYZ Limited",
        assigned_sales_user_id: "user_sales_001",
        created_date: "2024-02-15T10:30:00Z",
      },
      {
        customer_id: "cust_003",
        customer_name: "DEF Industries",
        assigned_sales_user_id: "user_sales_002",
        created_date: "2024-03-20T14:00:00Z",
      },
      {
        customer_id: "cust_004",
        customer_name: "GHI Trading",
        assigned_sales_user_id: null,
        created_date: "2024-04-05T11:15:00Z",
      },
      {
        customer_id: "cust_005",
        customer_name: "JKL Manufacturing",
        assigned_sales_user_id: "user_sales_001",
        created_date: "2024-05-12T13:45:00Z",
      },
    ];

    const result = searchCustomerRecordsByPermission(
      currentUserId,
      searchKeyword,
      testCustomers
    );

    const expectedFilteredCustomers = [
      {
        customer_id: "cust_001",
        customer_name: "ABC Corporation",
        assigned_sales_user_id: "user_sales_001",
        created_date: "2024-01-10T09:00:00Z",
      },
      {
        customer_id: "cust_002",
        customer_name: "XYZ Limited",
        assigned_sales_user_id: "user_sales_001",
        created_date: "2024-02-15T10:30:00Z",
      },
      {
        customer_id: "cust_005",
        customer_name: "JKL Manufacturing",
        assigned_sales_user_id: "user_sales_001",
        created_date: "2024-05-12T13:45:00Z",
      },
    ];

    expect(result).toEqual(expectedFilteredCustomers);
    expect(result.length).toBe(3);
    expect(
      result.every((cust) => cust.assigned_sales_user_id === currentUserId)
    ).toBe(true);
    expect(result.every((cust) => cust.assigned_sales_user_id !== null)).toBe(
      true
    );
  });
});