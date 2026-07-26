import { detectDealStatusAndInvoiceDiscrepancies } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-128
  test("商談ステータス『受注』で請求書発行日が予定日と一致する場合、ズレなしと判定される", () => {
    const deal = {
      dealId: "DEAL-001",
      dealStatus: "受注",
      plannedInvoiceDate: new Date("2024-01-15T00:00:00Z"),
    };

    const invoice = {
      invoiceId: "INV-001",
      dealId: "DEAL-001",
      issuedDate: new Date("2024-01-15T00:00:00Z"),
      issuanceStatus: "発行済み",
    };

    const result = detectDealStatusAndInvoiceDiscrepancies([deal], [invoice]);

    expect(result).toEqual({
      discrepanciesDetected: false,
      unInvoicedDeals: [],
      delayedDeals: [],
      matchingDeals: [
        {
          dealId: "DEAL-001",
          dealStatus: "受注",
          plannedInvoiceDate: new Date("2024-01-15T00:00:00Z"),
          invoicedDate: new Date("2024-01-15T00:00:00Z"),
          discrepancyType: "ズレなし",
        },
      ],
    });

    expect(result.discrepanciesDetected).toBe(false);
    expect(result.unInvoicedDeals.length).toBe(0);
    expect(result.delayedDeals.length).toBe(0);
    expect(result.matchingDeals.length).toBe(1);
    expect(result.matchingDeals[0].discrepancyType).toBe("ズレなし");
  });
});