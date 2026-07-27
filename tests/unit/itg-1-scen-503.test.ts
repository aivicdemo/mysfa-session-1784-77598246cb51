import { detectDealAndInvoiceMismatch } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-503
  test("商談ステータスが「受注」で請求書発行日が商談クローズ日より5日後のとき、5日のズレが検出される", () => {
    const dealCloseDateStr = "2024-01-10";
    const invoiceIssuedDateStr = "2024-01-15";
    const dealId = "DEAL-503";
    const dealName = "テスト商談-503";
    const customerId = "CUST-A";
    const customerName = "テスト顧客A";
    const dealAmount = 1000000;
    const dealStatus = "受注";

    const dealRecord = {
      dealId: dealId,
      dealName: dealName,
      customerId: customerId,
      customerName: customerName,
      dealAmount: dealAmount,
      dealStatus: dealStatus,
      dealCloseDate: new Date(dealCloseDateStr + "T00:00:00Z"),
    };

    const invoiceRecord = {
      invoiceId: "INV-503",
      dealId: dealId,
      invoiceIssuedDate: new Date(invoiceIssuedDateStr + "T00:00:00Z"),
      invoiceAmount: dealAmount,
    };

    const mismatchResult = detectDealAndInvoiceMismatch(
      dealRecord,
      invoiceRecord
    );

    expect(mismatchResult).toEqual({
      dealId: dealId,
      dealName: dealName,
      dealStatus: dealStatus,
      dealCloseDate: new Date(dealCloseDateStr + "T00:00:00Z"),
      invoiceIssuedDate: new Date(invoiceIssuedDateStr + "T00:00:00Z"),
      mismatchDays: 5,
      mismatchType: "請求書発行が商談クローズ日より遅延",
      detected: true,
    });

    expect(mismatchResult.mismatchDays).toBe(5);
    expect(mismatchResult.mismatchType).toBe(
      "請求書発行が商談クローズ日より遅延"
    );
    expect(mismatchResult.detected).toBe(true);
  });
});