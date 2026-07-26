import { detectDelayedCases } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-212
  test("請求予定日を超過した『受注』『完了』案件を『遅延案件』として正しく特定できる", () => {
    const referenceDate = new Date("2024-01-15T00:00:00Z");

    const dealA = {
      dealId: "A",
      dealName: "案件A",
      status: "受注",
      requestedBillingDate: new Date("2023-12-16T00:00:00Z"),
      invoiceIssuanceDate: null,
    };

    const dealB = {
      dealId: "B",
      dealName: "案件B",
      status: "完了",
      requestedBillingDate: new Date("2023-11-16T00:00:00Z"),
      invoiceIssuanceDate: null,
    };

    const dealC = {
      dealId: "C",
      dealName: "案件C",
      status: "受注",
      requestedBillingDate: new Date("2024-01-20T00:00:00Z"),
      invoiceIssuanceDate: null,
    };

    const dealD = {
      dealId: "D",
      dealName: "案件D",
      status: "完了",
      requestedBillingDate: new Date("2023-12-31T00:00:00Z"),
      invoiceIssuanceDate: new Date("2024-01-05T00:00:00Z"),
    };

    const deals = [dealA, dealB, dealC, dealD];

    const result = detectDelayedCases(deals, referenceDate);

    expect(result).toBeDefined();
    expect(Array.isArray(result.delayedCases)).toBe(true);
    expect(result.delayedCases.length).toBe(2);

    const delayedDealIds = result.delayedCases.map(
      (item: { dealId: string }) => item.dealId
    );
    expect(delayedDealIds).toContain("A");
    expect(delayedDealIds).toContain("B");
    expect(delayedDealIds).not.toContain("C");
    expect(delayedDealIds).not.toContain("D");

    const delayedCaseA = result.delayedCases.find(
      (item: { dealId: string }) => item.dealId === "A"
    );
    expect(delayedCaseA).toBeDefined();
    expect(delayedCaseA.dealName).toBe("案件A");
    expect(delayedCaseA.status).toBe("受注");
    expect(delayedCaseA.requestedBillingDate).toEqual(
      new Date("2023-12-16T00:00:00Z")
    );
    expect(delayedCaseA.delayDays).toBe(30);

    const delayedCaseB = result.delayedCases.find(
      (item: { dealId: string }) => item.dealId === "B"
    );
    expect(delayedCaseB).toBeDefined();
    expect(delayedCaseB.dealName).toBe("案件B");
    expect(delayedCaseB.status).toBe("完了");
    expect(delayedCaseB.requestedBillingDate).toEqual(
      new Date("2023-11-16T00:00:00Z")
    );
    expect(delayedCaseB.delayDays).toBe(60);

    expect(result.totalDelayedCount).toBe(2);
    expect(result.totalDelayDays).toBe(90);
  });
});