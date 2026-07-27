import {
  validateInvoiceData,
} from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  // SCEN-839
  test("請求対象データ妥当性検証機能 - 請求データの順序が商談IDの降順のとき、順序に関わらず全件を検証する", () => {
    const invoiceDataSet = [
      {
        invoiceId: "INV-1005",
        dealId: 1005,
        customerId: "CUST-A",
        invoiceAmount: 150000,
        invoiceDate: "2024-01-15",
        targetPeriod: "2024-01",
        invoiceStatus: "draft",
      },
      {
        invoiceId: "INV-1003",
        dealId: 1003,
        customerId: "CUST-B",
        invoiceAmount: 250000,
        invoiceDate: "2024-01-16",
        targetPeriod: "2024-01",
        invoiceStatus: "draft",
      },
      {
        invoiceId: "INV-1001",
        dealId: 1001,
        customerId: "CUST-C",
        invoiceAmount: 100000,
        invoiceDate: "2024-01-17",
        targetPeriod: "2024-01",
        invoiceStatus: "draft",
      },
    ];

    const validationResults = validateInvoiceData(invoiceDataSet);

    expect(validationResults).toHaveLength(3);
    expect(validationResults[0]).toMatchObject({
      invoiceId: "INV-1005",
      dealId: 1005,
      isValid: true,
    });
    expect(validationResults[1]).toMatchObject({
      invoiceId: "INV-1003",
      dealId: 1003,
      isValid: true,
    });
    expect(validationResults[2]).toMatchObject({
      invoiceId: "INV-1001",
      dealId: 1001,
      isValid: true,
    });
    expect(validationResults[0].validationStatus).toBe("success");
    expect(validationResults[1].validationStatus).toBe("success");
    expect(validationResults[2].validationStatus).toBe("success");
  });
});