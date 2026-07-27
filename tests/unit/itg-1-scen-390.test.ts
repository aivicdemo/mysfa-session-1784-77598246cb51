import { fetchPurchaseHistory } from "../../src/logic/it-1";

describe("顧客レコード過去購買履歴表示機能", () => {
  test("SCEN-390: 同じ入力条件で2回実行しても同じ結果が返される", async () => {
    const customerId = "CUST-12345";
    const startDate = new Date("2024-01-01T00:00:00Z");
    const endDate = new Date("2024-12-31T23:59:59Z");

    const firstResult = await fetchPurchaseHistory({
      customerId,
      startDate,
      endDate,
    });

    const secondResult = await fetchPurchaseHistory({
      customerId,
      startDate,
      endDate,
    });

    expect(firstResult.recordCount).toBe(secondResult.recordCount);
    expect(firstResult.recordCount).toBe(3);

    expect(firstResult.records).toEqual(secondResult.records);

    expect(firstResult.records).toEqual([
      {
        orderId: "ORD-20240215-001",
        purchaseDate: new Date("2024-02-15T10:30:00Z"),
        amount: 50000,
        productName: "営業管理ライセンス年間プラン",
        quantity: 1,
      },
      {
        orderId: "ORD-20240618-002",
        purchaseDate: new Date("2024-06-18T14:15:00Z"),
        amount: 25000,
        productName: "追加ユーザーライセンス",
        quantity: 5,
      },
      {
        orderId: "ORD-20241120-003",
        purchaseDate: new Date("2024-11-20T09:45:00Z"),
        amount: 75000,
        productName: "エンタープライズパッケージ",
        quantity: 1,
      },
    ]);

    expect(firstResult.records[0].orderId).toBe(secondResult.records[0].orderId);
    expect(firstResult.records[1].orderId).toBe(secondResult.records[1].orderId);
    expect(firstResult.records[2].orderId).toBe(secondResult.records[2].orderId);

    expect(firstResult.records[0].purchaseDate.getTime()).toBe(
      secondResult.records[0].purchaseDate.getTime()
    );
    expect(firstResult.records[1].purchaseDate.getTime()).toBe(
      secondResult.records[1].purchaseDate.getTime()
    );
    expect(firstResult.records[2].purchaseDate.getTime()).toBe(
      secondResult.records[2].purchaseDate.getTime()
    );

    expect(firstResult.records[0].amount).toBe(secondResult.records[0].amount);
    expect(firstResult.records[0].amount).toBe(50000);
    expect(firstResult.records[1].amount).toBe(secondResult.records[1].amount);
    expect(firstResult.records[1].amount).toBe(25000);
    expect(firstResult.records[2].amount).toBe(secondResult.records[2].amount);
    expect(firstResult.records[2].amount).toBe(75000);

    expect(firstResult.records[0].productName).toBe(
      secondResult.records[0].productName
    );
    expect(firstResult.records[1].productName).toBe(
      secondResult.records[1].productName
    );
    expect(firstResult.records[2].productName).toBe(
      secondResult.records[2].productName
    );

    expect(firstResult.records[0].quantity).toBe(
      secondResult.records[0].quantity
    );
    expect(firstResult.records[1].quantity).toBe(
      secondResult.records[1].quantity
    );
    expect(firstResult.records[2].quantity).toBe(
      secondResult.records[2].quantity
    );
  });
});