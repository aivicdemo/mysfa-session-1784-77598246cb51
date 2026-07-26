import { describe, test, expect } from "@jest/globals";
import { validateInvoiceApproval } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-250: [error] 請求書承認検証機能 - 請求明細行が空の請求書を承認時に検出してエラーを返す
  test("請求明細行が空の請求書を承認時にエラーを返す", () => {
    const invoiceData = {
      invoiceId: "INV-20240415-001",
      customerId: "CUST-12345",
      customerName: "株式会社テスト顧客",
      invoiceDate: "2024-04-15",
      totalAmount: 150000,
      invoiceLines: [],
      status: "PENDING_APPROVAL",
    };

    expect(() => validateInvoiceApproval(invoiceData)).toThrow(/請求明細/);
  });
});