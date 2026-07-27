import {
  detectInvoiceDiscrepancy,
} from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-520
  test("請求書発行日が空白のとき、日付ズレの判定がエラーで終了する", () => {
    const dealRecord = {
      deal_id: "DEAL-001",
      customer_id: "CUST-001",
      status: "成約",
      amount: 150000,
      planned_billing_date: new Date("2024-01-15T00:00:00Z"),
      created_at: new Date("2024-01-10T09:00:00Z"),
    };

    const invoiceRecord = {
      invoice_id: "INV-001",
      deal_id: "DEAL-001",
      customer_id: "CUST-001",
      amount: 150000,
      issued_date: null,
      status: "issued",
    };

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        file_id: "FILE-001",
        url: "https://example.com/documents/FILE-001",
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const mockNotificationServiceAdapter = {
      sendInvoiceNotification: jest
        .fn()
        .mockResolvedValue({ sent: true, message_id: "MSG-001" }),
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    expect(() =>
      detectInvoiceDiscrepancy(
        dealRecord,
        invoiceRecord,
        mockDocumentStorageAdapter,
        mockNotificationServiceAdapter
      )
    ).toThrow(/請求書発行日/);
  });
});