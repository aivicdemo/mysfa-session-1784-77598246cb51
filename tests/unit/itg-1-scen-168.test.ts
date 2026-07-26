import { detectUnbilledAndDelayedCases } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-168
  test("商談ステータスが『受注』でも請求書発行済みの案件は未請求案件として除外される", () => {
    const dealData = [
      {
        dealId: "DEAL-001",
        status: "受注",
        amount: 100000,
        invoiceIssued: true,
        invoiceIssuedDate: "2024-04-10",
      },
      {
        dealId: "DEAL-002",
        status: "受注",
        amount: 150000,
        invoiceIssued: false,
        invoiceIssuedDate: null,
      },
      {
        dealId: "DEAL-003",
        status: "受注",
        amount: 200000,
        invoiceIssued: true,
        invoiceIssuedDate: "2024-04-12",
      },
      {
        dealId: "DEAL-004",
        status: "完了",
        amount: 50000,
        invoiceIssued: false,
        invoiceIssuedDate: null,
      },
    ];

    const result = detectUnbilledAndDelayedCases(dealData);

    expect(result.unbilledCases).toHaveLength(2);
    expect(result.unbilledCases).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dealId: "DEAL-002",
          status: "受注",
          amount: 150000,
          invoiceIssued: false,
        }),
        expect.objectContaining({
          dealId: "DEAL-004",
          status: "完了",
          amount: 50000,
          invoiceIssued: false,
        }),
      ])
    );

    const unbilledDealIds = result.unbilledCases.map((c) => c.dealId);
    expect(unbilledDealIds).not.toContain("DEAL-001");
    expect(unbilledDealIds).not.toContain("DEAL-003");
  });
});