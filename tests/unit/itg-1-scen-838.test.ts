import { validateInvoiceTargetData } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  // SCEN-838
  test("請求対象データ妥当性検証機能 - 複数の請求データに同一の顧客IDと異なる商談IDが含まれるとき、全て承認対象として検証を続行する", () => {
    const invoiceTargetDataSet = [
      {
        invoiceId: "INV-001",
        customerId: "CUST-001",
        dealId: "DEAL-101",
        amount: 100000,
        invoiceDate: "2024-04-15",
        startDate: "2024-04-01",
        endDate: "2024-04-30",
        status: "pending",
      },
      {
        invoiceId: "INV-002",
        customerId: "CUST-001",
        dealId: "DEAL-102",
        amount: 150000,
        invoiceDate: "2024-04-16",
        startDate: "2024-04-01",
        endDate: "2024-04-30",
        status: "pending",
      },
      {
        invoiceId: "INV-003",
        customerId: "CUST-001",
        dealId: "DEAL-103",
        amount: 200000,
        invoiceDate: "2024-04-17",
        startDate: "2024-04-01",
        endDate: "2024-04-30",
        status: "pending",
      },
    ];

    const result = validateInvoiceTargetData(invoiceTargetDataSet);

    expect(result.validationResults).toHaveLength(3);
    expect(result.validationResults[0]).toEqual({
      invoiceId: "INV-001",
      customerId: "CUST-001",
      dealId: "DEAL-101",
      isApprovalTarget: true,
      validationStatus: "承認対象",
    });
    expect(result.validationResults[1]).toEqual({
      invoiceId: "INV-002",
      customerId: "CUST-001",
      dealId: "DEAL-102",
      isApprovalTarget: true,
      validationStatus: "承認対象",
    });
    expect(result.validationResults[2]).toEqual({
      invoiceId: "INV-003",
      customerId: "CUST-001",
      dealId: "DEAL-103",
      isApprovalTarget: true,
      validationStatus: "承認対象",
    });
    expect(result.allApproved).toBe(true);
    expect(result.processableCount).toBe(3);
  });
});