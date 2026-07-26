import { reconcileSalesAndInvoiceData } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-223
  test("売上実績と請求データ照合 - 売上計上予定日と請求日の差異が1日以内の場合に許容ズレとして判定される", () => {
    const salesRecordPlannedDate = new Date("2024-01-15T00:00:00Z");
    const invoiceIssuedDate = new Date("2024-01-16T00:00:00Z");
    const salesTotalAmount = 100000;
    const invoiceAmount = 100000;
    const invoiceId = "INV-001";
    const salesId = "SAL-001";

    const reconciliationResult = reconcileSalesAndInvoiceData({
      salesId: salesId,
      salesTotalAmount: salesTotalAmount,
      salesPlannedDate: salesRecordPlannedDate,
      invoiceId: invoiceId,
      invoiceAmount: invoiceAmount,
      invoiceIssuedDate: invoiceIssuedDate,
    });

    const dateDifferenceInDays = Math.abs(
      (invoiceIssuedDate.getTime() - salesRecordPlannedDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    expect(dateDifferenceInDays).toBeLessThanOrEqual(1);
    expect(reconciliationResult.dateDifferenceInDays).toBe(1);
    expect(reconciliationResult.isWithinTolerance).toBe(true);
    expect(reconciliationResult.reconciliationStatus).toBe("許容範囲内");
    expect(reconciliationResult.amountMatch).toBe(true);
  });
});