import { reconcileSalesAndBillingData } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-220
  test("[normal] 売上実績と請求データ照合 - 売上計上予定日と請求日が一致する受注案件が照合完了と判定される", () => {
    const reconciliationDate = new Date("2024-04-30T23:59:59Z");
    const recognitionDate = new Date("2024-04-15T00:00:00Z");
    const billingDate = new Date("2024-04-15T00:00:00Z");

    const salesData = {
      dealId: "DEAL-001",
      customerId: "CUST-001",
      dealStatus: "受注",
      amount: 500000,
      recognitionPlannedDate: recognitionDate,
      recognitionActualDate: recognitionDate,
    };

    const billingData = {
      dealId: "DEAL-001",
      customerId: "CUST-001",
      invoiceId: "INV-001",
      billingAmount: 500000,
      billingDate: billingDate,
      isIssued: true,
    };

    const result = reconcileSalesAndBillingData({
      salesRecords: [salesData],
      billingRecords: [billingData],
      reconciliationDate: reconciliationDate,
    });

    expect(result).toEqual({
      reconciliationStatus: "完了",
      matchedDeals: [
        {
          dealId: "DEAL-001",
          customerId: "CUST-001",
          dealStatus: "受注",
          recognitionPlannedDate: recognitionDate,
          billingDate: billingDate,
          reconciliationResult: "照合完了",
          dateDifferenceDays: 0,
          amountMatch: true,
          billingStatus: "発行済み",
        },
      ],
      unmatchedDeals: [],
      pendingDeals: [],
      totalMatchedCount: 1,
      totalUnmatchedCount: 0,
      totalPendingCount: 0,
    });
  });
});