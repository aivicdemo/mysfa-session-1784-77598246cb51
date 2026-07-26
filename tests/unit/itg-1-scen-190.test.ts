import { detectUnbilledAndDelayedCasesWithSLA } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-190
  test("月次決算時の未請求・遅延案件の段階的検出と対応SLA管理機能 - 営業管理者への報告SLA（期限2営業日前）に従って通知が送信される", () => {
    const currentDate = new Date("2024-01-15T09:00:00Z");
    const billingDeadline = new Date("2024-01-22T23:59:59Z");
    const deliveryDate = new Date("2024-01-18T23:59:59Z");
    const slaNotificationDate = new Date("2024-01-20T09:00:00Z");

    const unbilledCase = {
      caseId: "CASE-001",
      caseName: "未請求案件A",
      customerId: "CUST-001",
      customerName: "顧客A",
      dealAmount: 500000,
      dealStatus: "受注",
      billingStatus: "未請求",
      billingDeadline: billingDeadline.toISOString(),
      createdAt: new Date("2024-01-10T10:00:00Z").toISOString(),
      updatedAt: currentDate.toISOString(),
    };

    const delayedCase = {
      caseId: "CASE-002",
      caseName: "遅延案件B",
      customerId: "CUST-002",
      customerName: "顧客B",
      dealAmount: 300000,
      dealStatus: "受注",
      billingStatus: "請求済み",
      billingScheduledDate: deliveryDate.toISOString(),
      actualBillingDate: new Date("2024-01-20T10:00:00Z").toISOString(),
      createdAt: new Date("2024-01-08T10:00:00Z").toISOString(),
      updatedAt: currentDate.toISOString(),
    };

    const input = {
      currentSystemDate: currentDate.toISOString(),
      monthlyClosingDeadline: new Date("2024-01-31T23:59:59Z").toISOString(),
      slaNotificationDate: slaNotificationDate.toISOString(),
      cases: [unbilledCase, delayedCase],
      notificationRecipient: "admin@company.com",
    };

    const result = detectUnbilledAndDelayedCasesWithSLA(input);

    expect(result).toBeDefined();
    expect(result.unbilledCases).toBeDefined();
    expect(result.delayedCases).toBeDefined();
    expect(result.notifications).toBeDefined();

    expect(result.unbilledCases).toHaveLength(1);
    expect(result.unbilledCases[0]).toEqual({
      caseId: "CASE-001",
      caseName: "未請求案件A",
      customerId: "CUST-001",
      customerName: "顧客A",
      dealAmount: 500000,
      dealStatus: "受注",
      billingStatus: "未請求",
      billingDeadline: billingDeadline.toISOString(),
      daysUntilDeadline: 6,
    });

    expect(result.delayedCases).toHaveLength(1);
    expect(result.delayedCases[0]).toEqual({
      caseId: "CASE-002",
      caseName: "遅延案件B",
      customerId: "CUST-002",
      customerName: "顧客B",
      dealAmount: 300000,
      dealStatus: "受注",
      billingStatus: "請求済み",
      billingScheduledDate: deliveryDate.toISOString(),
      actualBillingDate: new Date("2024-01-20T10:00:00Z").toISOString(),
      delayDays: 2,
    });

    expect(result.notifications).toHaveLength(2);

    const unbilledNotification = result.notifications.find(
      (n) => n.caseId === "CASE-001"
    );
    expect(unbilledNotification).toBeDefined();
    expect(unbilledNotification?.notificationType).toBe("未請求案件通知");
    expect(unbilledNotification?.recipient).toBe("admin@company.com");
    expect(unbilledNotification?.subject).toContain("未請求案件A");
    expect(unbilledNotification?.slaDeadline).toBe(
      slaNotificationDate.toISOString()
    );
    expect(unbilledNotification?.slaDescription).toBe("2営業日以内に対応必要");
    expect(unbilledNotification?.sentAt).toBe(slaNotificationDate.toISOString());

    const delayedNotification = result.notifications.find(
      (n) => n.caseId === "CASE-002"
    );
    expect(delayedNotification).toBeDefined();
    expect(delayedNotification?.notificationType).toBe("遅延案件通知");
    expect(delayedNotification?.recipient).toBe("admin@company.com");
    expect(delayedNotification?.subject).toContain("遅延案件B");
    expect(delayedNotification?.slaDeadline).toBe(
      slaNotificationDate.toISOString()
    );
    expect(delayedNotification?.slaDescription).toBe("2営業日以内に対応必要");
    expect(delayedNotification?.sentAt).toBe(slaNotificationDate.toISOString());

    expect(result.notificationLog).toBeDefined();
    expect(result.notificationLog).toHaveLength(2);
    expect(result.notificationLog[0]).toEqual({
      notificationId: expect.any(String),
      caseId: "CASE-001",
      caseName: "未請求案件A",
      notificationType: "未請求案件通知",
      recipient: "admin@company.com",
      subject: expect.stringContaining("未請求案件A"),
      sentAt: slaNotificationDate.toISOString(),
      slaDeadline: slaNotificationDate.toISOString(),
    });

    expect(result.notificationLog[1]).toEqual({
      notificationId: expect.any(String),
      caseId: "CASE-002",
      caseName: "遅延案件B",
      notificationType: "遅延案件通知",
      recipient: "admin@company.com",
      subject: expect.stringContaining("遅延案件B"),
      sentAt: slaNotificationDate.toISOString(),
      slaDeadline: slaNotificationDate.toISOString(),
    });

    expect(result.summaryMetrics).toBeDefined();
    expect(result.summaryMetrics.totalUnbilledCaseCount).toBe(1);
    expect(result.summaryMetrics.totalDelayedCaseCount).toBe(1);
    expect(result.summaryMetrics.totalUnbilledAmount).toBe(500000);
    expect(result.summaryMetrics.totalDelayedAmount).toBe(300000);
    expect(result.summaryMetrics.slaComplianceStatus).toBe("通知送信完了");
  });
});