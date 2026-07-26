import {
  detectUnbilledAndDelayedCases,
} from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-230
  test("SLA違反：営業管理者報告期限（2営業日前）を過ぎても検出されない場合はエラーとなる", () => {
    const today = new Date("2024-04-15T09:00:00Z"); // 基準日：月末決算3営業日前（営業管理者報告期限）
    const contractDateThreeBizDaysAgo = new Date("2024-04-10T09:00:00Z"); // 3営業日以前に契約済み
    const monthEndDeadline = new Date("2024-04-30T23:59:59Z");

    const deal = {
      dealId: "DEAL-001",
      customerId: "CUST-100",
      dealStatus: "契約済み",
      dealAmount: 1000000,
      contractDate: contractDateThreeBizDaysAgo,
      expectedBillingDate: new Date("2024-04-12T00:00:00Z"),
    };

    const invoice = {
      invoiceId: null, // 請求書未発行
      dealId: "DEAL-001",
      invoiceAmount: null,
      invoiceIssuedDate: null,
      invoiceStatus: "未発行",
    };

    const slaConfig = {
      managerReportDeadlineBusinessDaysBefore: 2, // 月末決算2営業日前が報告期限
      salesPersonActionDeadlineBusinessDaysBefore: 1, // 月末決算1営業日前が営業担当者対応期限
    };

    const result = detectUnbilledAndDelayedCases(
      {
        deals: [deal],
        invoices: [invoice],
        currentDate: today,
        monthEndDeadline: monthEndDeadline,
        slaConfig: slaConfig,
      }
    );

    // SLA違反が検出される
    expect(result.slaViolationsDetected).toBe(true);

    // 違反内容が記録される
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]).toEqual({
      dealId: "DEAL-001",
      dealStatus: "契約済み",
      invoiceStatus: "未発行",
      violationType: "SLA_MANAGER_REPORT_DEADLINE_EXCEEDED",
      excessDays: 2,
      businessDaysOverDeadline: 2,
      requiredAction: "MANAGER_ESCALATION_REQUIRED",
      managerNotificationRequired: true,
    });

    // エラー通知フラグが立つ
    expect(result.managerNotificationRequired).toBe(true);

    // エラーレポートに違反内容が記録される
    expect(result.errorReport).toBeDefined();
    expect(result.errorReport.violationCount).toBe(1);
    expect(result.errorReport.violations[0].dealId).toBe("DEAL-001");
    expect(result.errorReport.violations[0].violationType).toBe(
      "SLA_MANAGER_REPORT_DEADLINE_EXCEEDED"
    );
    expect(result.errorReport.violations[0].businessDaysOverDeadline).toBe(2);

    // エラーレポートに詳細が含まれる
    expect(result.errorReport.summary).toContain("SLA違反");
    expect(result.errorReport.timestamp).toBeDefined();
  });
});