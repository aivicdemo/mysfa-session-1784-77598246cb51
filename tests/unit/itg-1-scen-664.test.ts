import { reconcileSalesAndInvoices } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-664
  test("[normal] 売上実績と請求書のズレ解消機能 - 照合結果を2回実行しても同じ結果が返される", () => {
    const salesRecord = {
      salesId: "SALES-001",
      customerId: "CUST-001",
      salesDate: new Date("2024-01-15T00:00:00Z"),
      amount: 100000,
    };

    const invoiceRecord = {
      invoiceId: "INV-001",
      customerId: "CUST-001",
      invoiceDate: new Date("2024-01-20T00:00:00Z"),
      amount: 100000,
    };

    const testData = {
      sales: [salesRecord],
      invoices: [invoiceRecord],
    };

    const firstReconciliationResult = reconcileSalesAndInvoices(testData);
    const secondReconciliationResult = reconcileSalesAndInvoices(testData);

    expect(firstReconciliationResult.reconciliationStatus).toBe(
      secondReconciliationResult.reconciliationStatus
    );
    expect(firstReconciliationResult.reconciliationStatus).toBe("完全一致");

    expect(firstReconciliationResult.matchingCount).toBe(
      secondReconciliationResult.matchingCount
    );
    expect(firstReconciliationResult.matchingCount).toBe(1);

    expect(firstReconciliationResult.discrepancyAmount).toBe(
      secondReconciliationResult.discrepancyAmount
    );
    expect(firstReconciliationResult.discrepancyAmount).toBe(0);

    expect(firstReconciliationResult.matchingDetails).toEqual(
      secondReconciliationResult.matchingDetails
    );
    expect(firstReconciliationResult.matchingDetails).toHaveLength(1);
    expect(firstReconciliationResult.matchingDetails[0]).toEqual({
      customerId: "CUST-001",
      salesAmount: 100000,
      invoiceAmount: 100000,
      salesDate: new Date("2024-01-15T00:00:00Z"),
      invoiceDate: new Date("2024-01-20T00:00:00Z"),
      matchStatus: "一致",
    });
  });
});