import { searchCustomers } from "../../src/logic/it-1";

describe("顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能", () => {
  // SCEN-367
  test("検索入力に前後の空白が含まれている場合、トリム処理されて検索される", async () => {
    const mockCustomers = [
      {
        customerId: "CUST001",
        customerName: "田中商事",
        industryType: "製造業",
        representativeName: "田中太郎",
        phone: "090-1234-5678",
        email: "tanaka@example.com",
      },
      {
        customerId: "CUST002",
        customerName: "田中電機",
        industryType: "電機",
        representativeName: "田中次郎",
        phone: "090-2345-6789",
        email: "denki@example.com",
      },
      {
        customerId: "CUST003",
        customerName: "山田物産",
        industryType: "商社",
        representativeName: "山田花子",
        phone: "090-3456-7890",
        email: "yamada@example.com",
      },
    ];

    const searchInput = "  田中商事  ";
    const expectedSearchTerm = "田中商事";

    const result = await searchCustomers(searchInput, mockCustomers);

    expect(result).toEqual([
      {
        customerId: "CUST001",
        customerName: "田中商事",
        industryType: "製造業",
        representativeName: "田中太郎",
        phone: "090-1234-5678",
        email: "tanaka@example.com",
      },
    ]);

    expect(result.length).toBe(1);
    expect(result[0].customerName).toBe(expectedSearchTerm);
  });
});