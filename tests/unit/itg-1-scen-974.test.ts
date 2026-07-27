import { reconcileSalesAndInvoices } from "../../src/logic/it-1784969823049-1-1-1";

describe("売上実績・請求状況照合機能", () => {
  // SCEN-974
  test("照合対象期間が月初（例：1月1日）から開始する場合、その日のデータから正常に照合が開始される", () => {
    const salesRecords = [
      {
        salesId: "S001",
        customerId: "C001",
        salesAmount: 100000,
        salesDate: new Date("2024-01-01T00:00:00Z"),
        productCode: "P001",
      },
    ];

    const invoiceRecords = [
      {
        invoiceId: "I001",
        customerId: "C001",
        invoiceAmount: 100000,
        invoiceDate: new Date("2024-01-01T00:00:00Z"),
        productCode: "P001",
      },
    ];

    const reconciliationStartDate = new Date("2024-01-01T00:00:00Z");
    const reconciliationEndDate = new Date("2024-01-31T23:59:59Z");

    const result = reconcileSalesAndInvoices(
      salesRecords,
      invoiceRecords,
      reconciliationStartDate,
      reconciliationEndDate
    );

    expect(result.reconciliationResults).toHaveLength(1);
    expect(result.reconciliationResults[0]).toEqual({
      salesId: "S001",
      invoiceId: "I001",
      customerId: "C001",
      salesAmount: 100000,
      invoiceAmount: 100000,
      reconciliationStatus: "完全一致",
      productCode: "P001",
    });
    expect(result.totalReconciled).toBe(1);
    expect(result.reconciliationPeriod).toEqual({
      startDate: new Date("2024-01-01T00:00:00Z"),
      endDate: new Date("2024-01-31T23:59:59Z"),
    });
  });
});