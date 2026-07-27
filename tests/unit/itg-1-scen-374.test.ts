import { fetchPurchaseHistoryByCustomerAndPeriod } from "../../src/logic/it-1";

describe("顧客レコード過去購買履歴表示機能", () => {
  test("SCEN-374: 対象期間の開始日の購買履歴が含まれる", () => {
    // Arrange
    const customerId = "TEST-CUST-001";
    const periodStartDate = new Date("2024-01-01T00:00:00Z");
    const periodEndDate = new Date("2024-01-31T23:59:59Z");

    const purchaseHistoryRecords = [
      {
        customerId: "TEST-CUST-001",
        productId: "PROD-A",
        amount: 10000,
        status: "完了",
        purchaseDate: new Date("2024-01-01T10:00:00Z"),
      },
      {
        customerId: "TEST-CUST-001",
        productId: "PROD-B",
        amount: 5000,
        status: "完了",
        purchaseDate: new Date("2023-12-31T14:00:00Z"),
      },
      {
        customerId: "TEST-CUST-001",
        productId: "PROD-C",
        amount: 15000,
        status: "完了",
        purchaseDate: new Date("2024-01-31T16:00:00Z"),
      },
    ];

    // Act
    const result = fetchPurchaseHistoryByCustomerAndPeriod(
      customerId,
      periodStartDate,
      periodEndDate,
      purchaseHistoryRecords
    );

    // Assert
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      customerId: "TEST-CUST-001",
      productId: "PROD-A",
      amount: 10000,
      status: "完了",
      purchaseDate: new Date("2024-01-01T10:00:00Z"),
    });
    expect(result[1]).toEqual({
      customerId: "TEST-CUST-001",
      productId: "PROD-C",
      amount: 15000,
      status: "完了",
      purchaseDate: new Date("2024-01-31T16:00:00Z"),
    });
  });
});