import { describe, test, expect } from "@jest/globals";
import { reconcileSalesAndInvoice } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-959
  test("売上実績の記録日付が請求書の発行日付より1日遅い場合、日付ズレが不整合として検出される", () => {
    const salesRecordDate = new Date("2024-01-15T00:00:00Z");
    const invoiceIssuedDate = new Date("2024-01-14T00:00:00Z");

    const salesRecord = {
      salesId: "SALES-001",
      customerId: "CUST-001",
      amount: 100000,
      recordedDate: salesRecordDate,
      dealStatus: "受注",
    };

    const invoiceRecord = {
      invoiceId: "INV-001",
      customerId: "CUST-001",
      invoiceAmount: 100000,
      issuedDate: invoiceIssuedDate,
      status: "発行済み",
    };

    const result = reconcileSalesAndInvoice(salesRecord, invoiceRecord);

    expect(result.reconciliationStatus).toBe("NG");
    expect(result.discrepancyType).toBe("日付ズレ");
    expect(result.discrepancyDetail).toBe(
      "売上実績記録日付(2024-01-15)が請求書発行日付(2024-01-14)より1日遅い"
    );
    expect(result.completionStatus).toBe("完了_要確認");
    expect(result.dateDifferenceDays).toBe(1);
  });
});