import { detectUnbilledAndDelayedCases } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-263
  test("未請求・遅延案件自動検出機能 - 商談が受注ステータスで請求実行タイミングに達した場合に未請求案件と遅延案件が自動検出される", () => {
    const today = new Date("2024-04-15T00:00:00Z");
    const yesterday = new Date("2024-04-14T00:00:00Z");
    const tomorrow = new Date("2024-04-16T00:00:00Z");

    const dealData = [
      {
        dealId: "DEAL-001",
        customerId: "CUST-A",
        customerName: "ABC株式会社",
        status: "受注",
        amount: 500000,
        billingScheduledDate: yesterday,
        invoiceIssuedDate: null,
        invoiceId: null,
      },
      {
        dealId: "DEAL-002",
        customerId: "CUST-B",
        customerName: "XYZ株式会社",
        status: "受注",
        amount: 300000,
        billingScheduledDate: new Date("2024-04-10T00:00:00Z"),
        invoiceIssuedDate: null,
        invoiceId: null,
      },
      {
        dealId: "DEAL-003",
        customerId: "CUST-C",
        customerName: "DEF株式会社",
        status: "受注",
        amount: 200000,
        billingScheduledDate: tomorrow,
        invoiceIssuedDate: null,
        invoiceId: null,
      },
      {
        dealId: "DEAL-004",
        customerId: "CUST-D",
        customerName: "GHI株式会社",
        status: "受注",
        amount: 150000,
        billingScheduledDate: new Date("2024-04-12T00:00:00Z"),
        invoiceIssuedDate: new Date("2024-04-13T00:00:00Z"),
        invoiceId: "INV-001",
      },
      {
        dealId: "DEAL-005",
        customerId: "CUST-E",
        customerName: "JKL株式会社",
        status: "提案中",
        amount: 100000,
        billingScheduledDate: yesterday,
        invoiceIssuedDate: null,
        invoiceId: null,
      },
    ];

    const detectionResult = detectUnbilledAndDelayedCases(dealData, today);

    expect(detectionResult).toBeDefined();
    expect(detectionResult.unbilledCases).toBeDefined();
    expect(detectionResult.delayedCases).toBeDefined();

    expect(detectionResult.unbilledCases).toHaveLength(2);
    expect(detectionResult.unbilledCases).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dealId: "DEAL-001",
          customerId: "CUST-A",
          customerName: "ABC株式会社",
          status: "受注",
          amount: 500000,
          billingScheduledDate: yesterday,
          invoiceIssuedDate: null,
          invoiceId: null,
        }),
        expect.objectContaining({
          dealId: "DEAL-002",
          customerId: "CUST-B",
          customerName: "XYZ株式会社",
          status: "受注",
          amount: 300000,
          billingScheduledDate: new Date("2024-04-10T00:00:00Z"),
          invoiceIssuedDate: null,
          invoiceId: null,
        }),
      ])
    );

    expect(detectionResult.delayedCases).toHaveLength(2);
    expect(detectionResult.delayedCases).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dealId: "DEAL-001",
          customerId: "CUST-A",
          customerName: "ABC株式会社",
          status: "受注",
          amount: 500000,
          billingScheduledDate: yesterday,
          daysOverdue: 1,
        }),
        expect.objectContaining({
          dealId: "DEAL-002",
          customerId: "CUST-B",
          customerName: "XYZ株式会社",
          status: "受注",
          amount: 300000,
          billingScheduledDate: new Date("2024-04-10T00:00:00Z"),
          daysOverdue: 5,
        }),
      ])
    );

    expect(detectionResult.totalUnbilledAmount).toBe(800000);
    expect(detectionResult.totalDelayedAmount).toBe(800000);

    const deal001 = detectionResult.unbilledCases.find(
      (c) => c.dealId === "DEAL-001"
    );
    expect(deal001).toBeDefined();
    expect(deal001?.dealId).toBe("DEAL-001");
    expect(deal001?.customerId).toBe("CUST-A");
    expect(deal001?.customerName).toBe("ABC株式会社");
    expect(deal001?.status).toBe("受注");
    expect(deal001?.amount).toBe(500000);
    expect(deal001?.billingScheduledDate).toEqual(yesterday);

    const deal004 = detectionResult.unbilledCases.find(
      (c) => c.dealId === "DEAL-004"
    );
    expect(deal004).toBeUndefined();

    const deal005 = detectionResult.unbilledCases.find(
      (c) => c.dealId === "DEAL-005"
    );
    expect(deal005).toBeUndefined();

    const deal003 = detectionResult.unbilledCases.find(
      (c) => c.dealId === "DEAL-003"
    );
    expect(deal003).toBeUndefined();
  });
});