import { generateMonthlyFinancialReport } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-324
  test("月次決算レポート生成機能 - 商談レコードに請求書が紐付いていない場合、未請求額として売上実績に算入される", () => {
    const deal_001 = {
      dealId: "DEAL-001",
      customerId: "CUST-A",
      customerName: "テスト顧客A",
      amount: 1000000,
      status: "クローズ済み（成約）",
      closedDate: new Date("2024-01-15"),
      invoiceId: null,
    };

    const targetMonth = new Date("2024-01-01");

    const deals = [deal_001];

    const report = generateMonthlyFinancialReport(targetMonth, deals);

    const expectedUnbilledAmount = 1000000;
    expect(report.salesSummary.unbilledAmount).toBe(expectedUnbilledAmount);

    const unbilledDealIds = report.salesSummary.unbilledDeals.map(
      (deal: { dealId: string }) => deal.dealId
    );
    expect(unbilledDealIds).toContain("DEAL-001");

    const matchingUnbilledDeal = report.salesSummary.unbilledDeals.find(
      (deal: { dealId: string; amount: number }) => deal.dealId === "DEAL-001"
    );
    expect(matchingUnbilledDeal).toBeDefined();
    expect(matchingUnbilledDeal.amount).toBe(1000000);
  });
});