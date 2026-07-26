import { detectRevenueRecognitionDateDiscrepancies } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル - 商談情報参照機能", () => {
  // SCEN-087
  test("売上計上予定日と請求日のズレ検出 - 受注以外ステータスの商談は除外される", () => {
    const dealProposing = {
      dealId: "DEAL-001",
      status: "提案中",
      revenueRecognitionDate: new Date("2024-01-15"),
      invoiceIssuedDate: new Date("2024-01-01"),
    };

    const dealLost = {
      dealId: "DEAL-002",
      status: "失注",
      revenueRecognitionDate: new Date("2024-01-20"),
      invoiceIssuedDate: new Date("2024-01-05"),
    };

    const dealOnHold = {
      dealId: "DEAL-003",
      status: "保留中",
      revenueRecognitionDate: new Date("2024-01-25"),
      invoiceIssuedDate: new Date("2024-01-08"),
    };

    const dealWon = {
      dealId: "DEAL-004",
      status: "受注",
      revenueRecognitionDate: new Date("2024-02-01"),
      invoiceIssuedDate: new Date("2024-02-01"),
    };

    const dealWonWithDiscrepancy = {
      dealId: "DEAL-005",
      status: "受注",
      revenueRecognitionDate: new Date("2024-02-15"),
      invoiceIssuedDate: new Date("2024-02-01"),
    };

    const deals = [
      dealProposing,
      dealLost,
      dealOnHold,
      dealWon,
      dealWonWithDiscrepancy,
    ];

    const result = detectRevenueRecognitionDateDiscrepancies(deals);

    expect(result.excludedDeals).toHaveLength(3);
    expect(result.excludedDeals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dealId: "DEAL-001",
          status: "提案中",
          reason: "ステータス：受注以外のため除外",
        }),
        expect.objectContaining({
          dealId: "DEAL-002",
          status: "失注",
          reason: "ステータス：受注以外のため除外",
        }),
        expect.objectContaining({
          dealId: "DEAL-003",
          status: "保留中",
          reason: "ステータス：受注以外のため除外",
        }),
      ])
    );

    expect(result.processedDeals).toHaveLength(2);
    expect(result.processedDeals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dealId: "DEAL-004",
          status: "受注",
        }),
        expect.objectContaining({
          dealId: "DEAL-005",
          status: "受注",
        }),
      ])
    );

    const discrepancyDetected = result.processedDeals.find(
      (d) => d.dealId === "DEAL-005"
    );
    expect(discrepancyDetected).toBeDefined();
    expect(discrepancyDetected?.hasDiscrepancy).toBe(true);
    expect(discrepancyDetected?.discrepancyDays).toBe(14);

    const noDiscrepancy = result.processedDeals.find(
      (d) => d.dealId === "DEAL-004"
    );
    expect(noDiscrepancy).toBeDefined();
    expect(noDiscrepancy?.hasDiscrepancy).toBe(false);
    expect(noDiscrepancy?.discrepancyDays).toBe(0);

    expect(result.processingLog).toContain("ステータス：受注以外のため除外");
    expect(result.excludedCount).toBe(3);
    expect(result.processedCount).toBe(2);
  });
});