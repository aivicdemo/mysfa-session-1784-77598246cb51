import { sortDealHistoryByCreatedAt } from "../../src/logic/it-1";

describe("顧客レコード画面の過去商談履歴・活動記録の時系列表示機能", () => {
  // SCEN-404
  test("商談レコードの作成日時フィールドが欠けているとき、エラーが発生する", () => {
    const mockDealRecords = [
      {
        id: "deal-001",
        customerId: "cust-001",
        dealName: "ABC社との契約交渉",
        createdAt: new Date("2024-01-15T10:30:00Z"),
      },
      {
        id: "deal-002",
        customerId: "cust-001",
        dealName: "XYZ社との提案",
        createdAt: undefined,
      },
    ];

    expect(() => sortDealHistoryByCreatedAt(mockDealRecords)).toThrow(
      /createdAt/
    );
  });
});