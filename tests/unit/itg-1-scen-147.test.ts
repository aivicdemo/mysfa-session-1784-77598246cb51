import { filterPurchaseHistoryByDateRange } from "../../src/logic/it-1";

describe("顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能", () => {
  // SCEN-147
  test("過去購買履歴フィルタリング機能 - 対象期間外の古い購買履歴が除外されて表示されない", () => {
    const referenceDate = new Date("2024-05-26T00:00:00Z");
    const lookbackMonths = 12;

    const purchaseHistory = [
      {
        purchaseId: "p001",
        customerId: "cust001",
        amount: 100000,
        purchaseDate: new Date("2024-05-15T10:00:00Z"),
      },
      {
        purchaseId: "p002",
        customerId: "cust001",
        amount: 150000,
        purchaseDate: new Date("2024-01-10T14:30:00Z"),
      },
      {
        purchaseId: "p003",
        customerId: "cust001",
        amount: 75000,
        purchaseDate: new Date("2023-06-20T09:15:00Z"),
      },
      {
        purchaseId: "p004",
        customerId: "cust001",
        amount: 200000,
        purchaseDate: new Date("2021-04-05T11:00:00Z"),
      },
      {
        purchaseId: "p005",
        customerId: "cust001",
        amount: 50000,
        purchaseDate: new Date("2024-03-01T15:45:00Z"),
      },
    ];

    const result = filterPurchaseHistoryByDateRange(
      purchaseHistory,
      referenceDate,
      lookbackMonths
    );

    expect(result.length).toBe(4);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          purchaseId: "p001",
          amount: 100000,
          purchaseDate: new Date("2024-05-15T10:00:00Z"),
        }),
        expect.objectContaining({
          purchaseId: "p002",
          amount: 150000,
          purchaseDate: new Date("2024-01-10T14:30:00Z"),
        }),
        expect.objectContaining({
          purchaseId: "p003",
          amount: 75000,
          purchaseDate: new Date("2023-06-20T09:15:00Z"),
        }),
        expect.objectContaining({
          purchaseId: "p005",
          amount: 50000,
          purchaseDate: new Date("2024-03-01T15:45:00Z"),
        }),
      ])
    );

    const excludedRecord = result.find(
      (record) => record.purchaseId === "p004"
    );
    expect(excludedRecord).toBeUndefined();

    const oldestIncludedDate = new Date("2023-05-26T00:00:00Z");
    result.forEach((record) => {
      expect(record.purchaseDate.getTime()).toBeGreaterThanOrEqual(
        oldestIncludedDate.getTime()
      );
    });

    result.forEach((record) => {
      expect(record.purchaseDate.getTime()).toBeLessThanOrEqual(
        referenceDate.getTime()
      );
    });
  });
});