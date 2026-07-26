import { checkBillingDelayFlag } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル商談情報参照機能 - 未請求案件フラグ付与", () => {
  // SCEN-064
  test("請求書発行予定日が本日と一致する場合、請求遅延フラグが付与されない", () => {
    const today = new Date("2024-01-15T00:00:00Z");
    const dealRecord = {
      dealId: "DEAL-001",
      customerId: "CUST-001",
      customerName: "Test Customer Inc.",
      dealAmount: 500000,
      dealStatus: "受注",
      billingScheduledDate: "2024-01-15",
      billingIssuedDate: null,
      billingDelayFlag: false,
      unbilledFlag: true,
      createdAt: "2024-01-10T09:00:00Z",
    };

    const result = checkBillingDelayFlag(dealRecord, today);

    expect(result.dealId).toBe("DEAL-001");
    expect(result.billingDelayFlag).toBe(false);
    expect(result.unbilledFlag).toBe(true);
    expect(result.flagUpdateHistory).toEqual([
      {
        flagType: "unbilledFlag",
        previousValue: true,
        newValue: true,
        reason: "scheduled_date_matches_today",
        checkedAt: today.toISOString(),
      },
    ]);
  });
});