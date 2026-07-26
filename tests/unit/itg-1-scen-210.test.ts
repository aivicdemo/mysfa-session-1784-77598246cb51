import { detectUnbilledCases } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-210
  test("ステータスが『完了』で請求書未発行の案件は未請求案件に含まれない", () => {
    const deals = [
      {
        dealId: "D001",
        customerId: "C001",
        status: "受注",
        amount: 100000,
        invoiceIssuedDate: null,
        invoiceScheduledDate: new Date("2024-01-15"),
      },
      {
        dealId: "D002",
        customerId: "C002",
        status: "完了",
        amount: 50000,
        invoiceIssuedDate: null,
        invoiceScheduledDate: new Date("2024-01-20"),
      },
      {
        dealId: "D003",
        customerId: "C003",
        status: "受注",
        amount: 75000,
        invoiceIssuedDate: new Date("2024-01-10"),
        invoiceScheduledDate: new Date("2024-01-15"),
      },
      {
        dealId: "D004",
        customerId: "C004",
        status: "完了",
        amount: 120000,
        invoiceIssuedDate: new Date("2024-01-18"),
        invoiceScheduledDate: new Date("2024-01-20"),
      },
      {
        dealId: "D005",
        customerId: "C005",
        status: "提案中",
        amount: 30000,
        invoiceIssuedDate: null,
        invoiceScheduledDate: new Date("2024-02-01"),
      },
    ];

    const result = detectUnbilledCases(deals);

    expect(result.unbilledCases).toEqual([
      {
        dealId: "D001",
        customerId: "C001",
        status: "受注",
        amount: 100000,
        invoiceIssuedDate: null,
        invoiceScheduledDate: new Date("2024-01-15"),
        caseType: "unbilled",
      },
    ]);

    expect(result.unbilledCases).toHaveLength(1);

    const dealIds = result.unbilledCases.map((c: { dealId: string }) => c.dealId);
    expect(dealIds).not.toContain("D002");
    expect(dealIds).not.toContain("D003");
    expect(dealIds).not.toContain("D004");
    expect(dealIds).not.toContain("D005");

    const completedUnbilledDeal = result.unbilledCases.find(
      (c: { dealId: string; status: string }) => c.dealId === "D002"
    );
    expect(completedUnbilledDeal).toBeUndefined();

    expect(result.delayedCases).toEqual([]);

    expect(result.totalUnbilledAmount).toBe(100000);

    expect(result.excludedCompletedDeals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dealId: "D002",
          status: "完了",
          reason: "completed_status_excluded",
        }),
      ])
    );
  });
});