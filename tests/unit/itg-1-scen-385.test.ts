import { fetchPastPurchaseHistory } from "../../src/logic/it-1";

describe("顧客レコード過去購買履歴表示機能", () => {
  // SCEN-385: [normal] 顧客レコード過去購買履歴表示機能 - 同じ日付の購買履歴が複数件ある場合、全件が返される
  test("同じ日付の購買履歴が複数件ある場合、全件が返される", async () => {
    const customerId = "CUST-20240115-001";
    const targetDate = "2024-01-15";

    const purchaseHistories = [
      {
        orderId: "ORD-001",
        customerId: customerId,
        purchaseDate: targetDate,
        productName: "商品A",
        purchaseAmount: 50000,
      },
      {
        orderId: "ORD-002",
        customerId: customerId,
        purchaseDate: targetDate,
        productName: "商品B",
        purchaseAmount: 75000,
      },
      {
        orderId: "ORD-003",
        customerId: customerId,
        purchaseDate: targetDate,
        productName: "商品C",
        purchaseAmount: 120000,
      },
    ];

    const result = await fetchPastPurchaseHistory(customerId);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      orderId: "ORD-001",
      customerId: customerId,
      purchaseDate: targetDate,
      productName: "商品A",
      purchaseAmount: 50000,
    });
    expect(result[1]).toEqual({
      orderId: "ORD-002",
      customerId: customerId,
      purchaseDate: targetDate,
      productName: "商品B",
      purchaseAmount: 75000,
    });
    expect(result[2]).toEqual({
      orderId: "ORD-003",
      customerId: customerId,
      purchaseDate: targetDate,
      productName: "商品C",
      purchaseAmount: 120000,
    });

    const orderIds = result.map((r) => r.orderId);
    const uniqueOrderIds = new Set(orderIds);
    expect(uniqueOrderIds.size).toBe(3);

    const productNames = result.map((r) => r.productName);
    const uniqueProductNames = new Set(productNames);
    expect(uniqueProductNames.size).toBe(3);

    const amounts = result.map((r) => r.purchaseAmount);
    const uniqueAmounts = new Set(amounts);
    expect(uniqueAmounts.size).toBe(3);
  });
});