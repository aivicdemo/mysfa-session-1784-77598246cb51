import { describe, test, expect, beforeEach } from "@jest/globals";

describe("商談ステータスと請求データの紐付け・可視化", () => {
  // SCEN-294: [edge] 売上計上予定日が月初のとき、期日ズレの判定が正常に実行される
  test("売上計上予定日が月初で請求予定日が前月末の場合、期日ズレが正常に検出される", async () => {
    const { verifyDealInvoiceAlignment } = await import(
      "../../src/logic/it-1784969823049-1-1-1"
    );

    const dealRecord = {
      dealId: "DEAL-001",
      customerName: "テスト顧客A",
      revenuePlanDate: new Date("2024-04-01"),
      dealStatus: "受注確定",
      dealAmount: 100000,
    };

    const invoiceRecord = {
      invoiceId: "INV-001",
      invoicePlanDate: new Date("2024-03-31"),
      invoiceAmount: 100000,
      dealId: "DEAL-001",
    };

    const result = verifyDealInvoiceAlignment(dealRecord, invoiceRecord);

    expect(result.hasDateMismatch).toBe(true);
    expect(result.daysDifference).toBe(-1);
    expect(result.dealId).toBe("DEAL-001");
    expect(result.invoiceId).toBe("INV-001");
    expect(result.mismatchDescription).toContain("1日");
    expect(result.mismatchDescription).toContain("早い");
    expect(result.dealStatusLinked).toBe("受注確定");
    expect(result.invoiceStatusLinked).toBe("INV-001");
    expect(result.isProcessedSuccessfully).toBe(true);
    expect(Array.isArray(result.internalRecords)).toBe(true);
    expect(result.internalRecords.length).toBeGreaterThan(0);
    expect(result.internalRecords[0]).toEqual(
      expect.objectContaining({
        dealId: "DEAL-001",
        invoiceId: "INV-001",
        hasDateMismatch: true,
        daysDifference: -1,
      })
    );
  });
});