import { validateInvoiceApproval } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-249: [error] 請求書承認検証機能 - 顧客情報が欠落している請求書を承認時に検出してエラーを返す
  test("should reject invoice approval when customer information is incomplete", () => {
    const invoiceData = {
      invoiceId: "INV-20240115-001",
      customerId: "CUST-12345",
      customerName: "", // 顧客名が欠落
      customerAddress: "東京都渋谷区",
      customerPhoneNumber: "09012345678",
      invoiceAmount: 150000,
      invoiceDate: "2024-01-15",
      dueDate: "2024-02-15",
      invoiceLineItems: [
        {
          lineItemId: "LINE-001",
          productName: "商品A",
          quantity: 2,
          unitPrice: 75000,
        },
      ],
      invoiceStatus: "pending_approval",
    };

    expect(() => validateInvoiceApproval(invoiceData)).toThrow(/顧客情報/);
  });
});