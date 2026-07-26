import { detectSalesRevenueRecognitionBillingDiscrepancy } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-259: [edge] 売上請求ズレ検出機能 - 売上計上予定日が請求日より1日遅延している場合が許容範囲内と判定される
  test("売上計上予定日が請求日より1日遅延している場合、許容範囲内と判定される", () => {
    const revenueRecognitionDate = new Date("2024-01-15T00:00:00Z");
    const billingDate = new Date("2024-01-14T00:00:00Z");
    const toleranceDaysDelay = 1;

    const result = detectSalesRevenueRecognitionBillingDiscrepancy({
      revenueRecognitionDate,
      billingDate,
      toleranceDaysDelay,
    });

    // ズレが許容範囲内（1日）であるため、statusは「OK」またはalertLevelが「warning」以下
    expect(result.status).toBe("OK");
    expect(result.alertLevel).toBeLessThanOrEqual(1); // 0=OK, 1=warning
    expect(result.isWithinTolerance).toBe(true);
    expect(result.discrepancyDays).toBe(-1); // 売上計上が請求より1日遅い
    expect(result.errorMessage).toBeUndefined();
  });
});