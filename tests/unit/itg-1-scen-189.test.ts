import { detectUnbilledAndDelayedDeals } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  test("SCEN-189: 月次決算期限の3営業日前に未請求案件と遅延案件が自動検出される", () => {
    // 月次決算設定
    const monthlyClosingDeadline = new Date("2024-04-30T23:59:59Z");
    const currentSystemDate = new Date("2024-04-25T10:00:00Z"); // 決算期限の3営業日前

    // 未請求案件データ: ステータス「受注」で請求書未発行
    const unbilledDeals = [
      {
        dealId: "DEAL-001",
        customerId: "CUST-A",
        dealStatus: "won",
        dealAmount: 500000,
        billedDate: null,
        expectedBillingDate: new Date("2024-04-20T23:59:59Z"),
      },
      {
        dealId: "DEAL-002",
        customerId: "CUST-B",
        dealStatus: "won",
        dealAmount: 300000,
        billedDate: null,
        expectedBillingDate: new Date("2024-04-18T23:59:59Z"),
      },
      {
        dealId: "DEAL-003",
        customerId: "CUST-C",
        dealStatus: "completed",
        dealAmount: 800000,
        billedDate: null,
        expectedBillingDate: new Date("2024-04-22T23:59:59Z"),
      },
    ];

    // 遅延案件データ: ステータス「受注」または「完了」で請求書発行済みだが請求予定日を超過
    const delayedDeals = [
      {
        dealId: "DEAL-004",
        customerId: "CUST-D",
        dealStatus: "won",
        dealAmount: 600000,
        billedDate: new Date("2024-04-10T10:00:00Z"),
        expectedBillingDate: new Date("2024-04-15T23:59:59Z"),
      },
      {
        dealId: "DEAL-005",
        customerId: "CUST-E",
        dealStatus: "completed",
        dealAmount: 1200000,
        billedDate: new Date("2024-04-05T10:00:00Z"),
        expectedBillingDate: new Date("2024-04-12T23:59:59Z"),
      },
    ];

    const result = detectUnbilledAndDelayedDeals({
      monthlyClosingDeadline,
      currentSystemDate,
      unbilledDeals,
      delayedDeals,
    });

    // 検出結果の検証
    expect(result.detectionTimestamp).toEqual(currentSystemDate);
    expect(result.daysBeforeDeadline).toBe(3);

    // 未請求案件の検出確認
    expect(result.detectedUnbilledDeals.length).toBe(3);
    expect(result.detectedUnbilledDeals[0]).toEqual({
      dealId: "DEAL-001",
      customerId: "CUST-A",
      dealAmount: 500000,
      slaStatus: "unbilled",
      warningFlag: true,
      notificationSent: true,
    });
    expect(result.detectedUnbilledDeals[1]).toEqual({
      dealId: "DEAL-002",
      customerId: "CUST-B",
      dealAmount: 300000,
      slaStatus: "unbilled",
      warningFlag: true,
      notificationSent: true,
    });
    expect(result.detectedUnbilledDeals[2]).toEqual({
      dealId: "DEAL-003",
      customerId: "CUST-C",
      dealAmount: 800000,
      slaStatus: "unbilled",
      warningFlag: true,
      notificationSent: true,
    });

    // 遅延案件の検出確認
    expect(result.detectedDelayedDeals.length).toBe(2);
    expect(result.detectedDelayedDeals[0]).toEqual({
      dealId: "DEAL-004",
      customerId: "CUST-D",
      dealAmount: 600000,
      daysOverdue: 10,
      slaStatus: "delayed",
      warningFlag: true,
      notificationSent: true,
    });
    expect(result.detectedDelayedDeals[1]).toEqual({
      dealId: "DEAL-005",
      customerId: "CUST-E",
      dealAmount: 1200000,
      daysOverdue: 13,
      slaStatus: "delayed",
      warningFlag: true,
      notificationSent: true,
    });

    // 合計金額の検証
    const totalUnbilledAmount = result.detectedUnbilledDeals.reduce(
      (sum, deal) => sum + deal.dealAmount,
      0
    );
    expect(totalUnbilledAmount).toBe(1600000);

    const totalDelayedAmount = result.detectedDelayedDeals.reduce(
      (sum, deal) => sum + deal.dealAmount,
      0
    );
    expect(totalDelayedAmount).toBe(1800000);

    // SLA管理フラグの検証
    expect(result.slaManagementStarted).toBe(true);
    expect(result.managementPhase).toBe("escalation_phase_1");

    // 通知レポート生成の検証
    expect(result.notificationReport.totalDealsDetected).toBe(5);
    expect(result.notificationReport.unbilledCount).toBe(3);
    expect(result.notificationReport.delayedCount).toBe(2);
    expect(result.notificationReport.allNotificationsSent).toBe(true);

    // エラーケース: 決算期限が無効な場合
    expect(() =>
      detectUnbilledAndDelayedDeals({
        monthlyClosingDeadline: new Date("2024-04-20T23:59:59Z"),
        currentSystemDate: new Date("2024-04-25T10:00:00Z"),
        unbilledDeals: [],
        delayedDeals: [],
      })
    ).toThrow(/決算期限/);

    // エラーケース: 決算期限の3営業日前ではない場合
    expect(() =>
      detectUnbilledAndDelayedDeals({
        monthlyClosingDeadline: new Date("2024-04-30T23:59:59Z"),
        currentSystemDate: new Date("2024-04-26T10:00:00Z"),
        unbilledDeals: [],
        delayedDeals: [],
      })
    ).toThrow(/3営業日前/);
  });
});