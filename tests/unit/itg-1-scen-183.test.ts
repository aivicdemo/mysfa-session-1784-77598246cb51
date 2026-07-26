import { searchCustomerRecords } from "../../src/logic/it-1";

describe("顧客レコード検索機能", () => {
  test("SCEN-183: 検索フィールドに1文字のみ入力した場合、部分一致で検索される", () => {
    // Precondition: 営業管理システムにログイン済み、顧客レコード検索画面が表示されている
    // Trigger: 検索フィールドに1文字のみ入力して検索ボタンをクリック
    // Expected: 入力した1文字を含む全顧客レコードが部分一致で検索され、結果一覧に表示される

    const mockCustomers = [
      {
        customerId: "CUST001",
        customerName: "Apple Inc.",
        industry: "Technology",
      },
      {
        customerId: "CUST002",
        customerName: "Acme Corporation",
        industry: "Manufacturing",
      },
      {
        customerId: "CUST003",
        customerName: "Blue Sky Ltd.",
        industry: "Consulting",
      },
      {
        customerId: "CUST004",
        customerName: "Amazon Web Services",
        industry: "Cloud",
      },
    ];

    // Test Case 1: 1文字入力で複数件ヒット（"A"を含む顧客）
    const searchInput1 = "A";
    const result1 = searchCustomerRecords(searchInput1, mockCustomers);

    expect(result1.success).toBe(true);
    expect(result1.records.length).toBe(3);
    expect(result1.records[0].customerId).toBe("CUST001");
    expect(result1.records[0].customerName).toBe("Apple Inc.");
    expect(result1.records[1].customerId).toBe("CUST002");
    expect(result1.records[1].customerName).toBe("Acme Corporation");
    expect(result1.records[2].customerId).toBe("CUST004");
    expect(result1.records[2].customerName).toBe("Amazon Web Services");

    // Test Case 2: 1文字入力で該当なし（"Z"を含む顧客がない場合）
    const searchInput2 = "Z";
    const result2 = searchCustomerRecords(searchInput2, mockCustomers);

    expect(result2.success).toBe(true);
    expect(result2.records.length).toBe(0);
    expect(result2.message).toBe("検索結果がありません");

    // Test Case 3: 1文字入力で1件ヒット（"B"を含む顧客）
    const searchInput3 = "B";
    const result3 = searchCustomerRecords(searchInput3, mockCustomers);

    expect(result3.success).toBe(true);
    expect(result3.records.length).toBe(2);
    expect(result3.records[0].customerId).toBe("CUST003");
    expect(result3.records[0].customerName).toBe("Blue Sky Ltd.");
    expect(result3.records[1].customerId).toBe("CUST004");
    expect(result3.records[1].customerName).toBe("Amazon Web Services");

    // Test Case 4: 空文字列入力時はエラー
    const searchInput4 = "";
    expect(() => searchCustomerRecords(searchInput4, mockCustomers)).toThrow(
      /検索キーワード/
    );

    // Test Case 5: 大文字小文字の区別なく検索される（"a"を入力した場合）
    const searchInput5 = "a";
    const result5 = searchCustomerRecords(searchInput5, mockCustomers);

    expect(result5.success).toBe(true);
    expect(result5.records.length).toBe(3);
    expect(result5.records.some((r) => r.customerName === "Apple Inc.")).toBe(
      true
    );
    expect(result5.records.some((r) => r.customerName === "Acme Corporation"))
      .toBe(true);
    expect(
      result5.records.some((r) => r.customerName === "Amazon Web Services")
    ).toBe(true);
  });
});