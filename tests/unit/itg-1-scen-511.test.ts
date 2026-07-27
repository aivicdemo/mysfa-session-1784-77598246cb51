import { detectDealInvoiceDiscrepancies } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-511
  test("商談ステータスが「受注」で複数の請求書がある場合、合計金額が商談金額と一致するとき、ズレがないと判定される", () => {
    const dealRecord = {
      dealId: "DEAL-001",
      status: "受注",
      amount: 300000,
    };

    const invoiceRecords = [
      {
        invoiceId: "INV-001",
        dealId: "DEAL-001",
        amount: 100000,
        issuedDate: "2024-01-15",
      },
      {
        invoiceId: "INV-002",
        dealId: "DEAL-001",
        amount: 100000,
        issuedDate: "2024-01-15",
      },
      {
        invoiceId: "INV-003",
        dealId: "DEAL-001",
        amount: 100000,
        issuedDate: "2024-01-15",
      },
    ];

    const result = detectDealInvoiceDiscrepancies(dealRecord, invoiceRecords);

    expect(result.hasDiscrepancy).toBe(false);
    expect(result.discrepancyType).toBe("ズレなし");
    expect(result.dealAmount).toBe(300000);
    expect(result.totalInvoicedAmount).toBe(300000);
    expect(result.anomalyFlagSet).toBe(false);
    expect(result.complianceLog).toMatch(/正常：金額一致/);
  });
});