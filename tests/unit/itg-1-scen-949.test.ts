import { extractSalesPerformanceByPeriod } from "../../src/logic/it-1784969823049-1-1-1";

describe("売上実績・請求データ照合機能", () => {
  // SCEN-949
  test("月次決算期間の終了日の売上実績が正しく抽出される", () => {
    const decisionPeriodStartDate = new Date("2024-01-01T00:00:00Z");
    const decisionPeriodEndDate = new Date("2024-01-31T23:59:59Z");

    const salesPerformanceWithinPeriod = {
      id: "SP-001",
      amount: 150000,
      productId: "PROD-001",
      customerId: "CUST-A",
      timestamp: new Date("2024-01-31T23:59:59Z"),
    };

    const salesPerformanceOutsidePeriod = {
      id: "SP-002",
      amount: 80000,
      productId: "PROD-002",
      customerId: "CUST-B",
      timestamp: new Date("2024-02-01T00:00:00Z"),
    };

    const allSalesPerformances = [
      salesPerformanceWithinPeriod,
      salesPerformanceOutsidePeriod,
    ];

    const result = extractSalesPerformanceByPeriod(
      allSalesPerformances,
      decisionPeriodStartDate,
      decisionPeriodEndDate
    );

    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe(150000);
    expect(result[0].productId).toBe("PROD-001");
    expect(result[0].customerId).toBe("CUST-A");
    expect(result[0].timestamp).toEqual(new Date("2024-01-31T23:59:59Z"));
  });
});