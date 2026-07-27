import { detectDelayedCases } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-566: [error] 商談ステータスが「受注」「完了」以外の場合、遅延案件判定の対象外となる
  test("商談ステータスが受注・完了以外の場合は遅延案件判定対象外となる", () => {
    const baseDate = new Date("2024-01-15T00:00:00Z");
    const thirtyDaysAgo = new Date("2023-12-16T00:00:00Z");

    const dealA = {
      dealId: "DEAL-001",
      customerId: "CUST-001",
      status: "見積提示",
      amount: 100000,
      estimatedDealDate: thirtyDaysAgo,
      invoiceIssuedDate: null,
      createdAt: new Date("2023-12-16T10:00:00Z"),
    };

    const dealB = {
      dealId: "DEAL-002",
      customerId: "CUST-002",
      status: "提案中",
      amount: 200000,
      estimatedDealDate: thirtyDaysAgo,
      invoiceIssuedDate: null,
      createdAt: new Date("2023-12-16T10:00:00Z"),
    };

    const dealC = {
      dealId: "DEAL-003",
      customerId: "CUST-003",
      status: "受注",
      amount: 300000,
      estimatedDealDate: thirtyDaysAgo,
      invoiceIssuedDate: null,
      createdAt: new Date("2023-12-16T10:00:00Z"),
    };

    const dealD = {
      dealId: "DEAL-004",
      customerId: "CUST-004",
      status: "完了",
      amount: 400000,
      estimatedDealDate: thirtyDaysAgo,
      invoiceIssuedDate: null,
      createdAt: new Date("2023-12-16T10:00:00Z"),
    };

    const deals = [dealA, dealB, dealC, dealD];

    const mockNotificationService = {
      sendLicenseOverageAlert: jest.fn(),
      sendUnusedUserAlert: jest.fn(),
      sendCostForecastAlert: jest.fn(),
    };

    const result = detectDelayedCases(deals, baseDate, mockNotificationService);

    expect(result.delayedCases).toHaveLength(2);
    expect(result.delayedCases.map((d) => d.dealId)).toEqual(
      expect.arrayContaining(["DEAL-003", "DEAL-004"])
    );
    expect(result.delayedCases.map((d) => d.dealId)).not.toEqual(
      expect.arrayContaining(["DEAL-001", "DEAL-002"])
    );
  });
});