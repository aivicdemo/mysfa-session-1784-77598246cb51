import { describe, test, expect, beforeEach, jest } from "@jest/globals";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-531
  test("請求書金額が負の値のとき、金額ズレの判定がエラーで終了する", async () => {
    const { reconcileDealAndInvoiceStatus } = await import(
      "../../src/logic/it-1784969823049-1-1-1"
    );

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const dealRecord = {
      dealId: "DEAL-001",
      customerId: "CUST-001",
      dealStatus: "受注",
      dealAmount: 50000,
      dealCreatedDate: "2024-01-15",
      dealClosedDate: "2024-01-15",
    };

    const invoiceRecord = {
      invoiceId: "INV-001",
      dealId: "DEAL-001",
      customerId: "CUST-001",
      invoiceAmount: -50000,
      invoiceIssuedDate: "2024-01-15",
      invoiceStatus: "発行済み",
    };

    const initialDealStatus = dealRecord.dealStatus;
    const initialInvoiceStatus = invoiceRecord.invoiceStatus;

    expect(() => {
      reconcileDealAndInvoiceStatus(
        dealRecord,
        invoiceRecord,
        mockDocumentStorageAdapter,
        mockNotificationServiceAdapter
      );
    }).toThrow(/請求金額/);

    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(
      mockNotificationServiceAdapter.sendInvoiceNotification
    ).not.toHaveBeenCalled();

    expect(dealRecord.dealStatus).toBe(initialDealStatus);
    expect(invoiceRecord.invoiceStatus).toBe(initialInvoiceStatus);
  });
});