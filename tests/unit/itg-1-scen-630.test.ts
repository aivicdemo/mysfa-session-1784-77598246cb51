import { reconcileDealsAndInvoices } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-630
  test("商談ステータスが『提案中』のとき、請求書との照合対象外として除外される", () => {
    const dealProposal = {
      dealId: "DEAL-001",
      customerName: "テスト顧客A",
      status: "提案中",
      amount: 1000000,
    };

    const invoice = {
      invoiceId: "INV-001",
      customerName: "テスト顧人A",
      amount: 1000000,
      issuedDate: new Date("2024-01-15T00:00:00Z"),
      invoiceStatus: "未払い",
    };

    const dealContracted = {
      dealId: "DEAL-002",
      customerName: "テスト顧客B",
      status: "受注済み",
      amount: 500000,
    };

    const invoiceForContracted = {
      invoiceId: "INV-002",
      customerName: "テスト顧客B",
      amount: 500000,
      issuedDate: new Date("2024-01-15T00:00:00Z"),
      invoiceStatus: "未払い",
    };

    const deals = [dealProposal, dealContracted];
    const invoices = [invoice, invoiceForContracted];

    const reconciliationResult = reconcileDealsAndInvoices(deals, invoices);

    expect(reconciliationResult.excludedDeals).toContainEqual({
      dealId: "DEAL-001",
      reason: "ステータスが照合対象外",
    });

    expect(reconciliationResult.reconciliationTargets).toContainEqual(
      expect.objectContaining({
        dealId: "DEAL-002",
      })
    );

    expect(
      reconciliationResult.reconciliationTargets.some(
        (item) => item.dealId === "DEAL-001"
      )
    ).toBe(false);

    expect(reconciliationResult.reconciliationTargets.length).toBe(1);
  });
});