import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  let fetchMock: any;

  beforeEach(() => {
    fetchMock = require("jest-fetch-mock");
    fetchMock.enableMocks();
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.disableMocks();
  });

  // SCEN-894
  test("商談が失注ステータスだが請求書が発行されているとき、ズレ検出が陽性を返す", async () => {
    const { verifyDealInvoiceDiscrepancy } = await import(
      "../../src/logic/it-1784969823049-1-1-1"
    );

    const dealId = "DEAL-20240101-001";
    const customerId = "CUST-20240101-001";
    const dealRecord = {
      deal_id: dealId,
      customer_id: customerId,
      customer_name: "テスト顧客A",
      deal_amount: 100000,
      deal_status: "失注",
      created_at: "2024-01-01T10:00:00Z",
    };

    const invoiceId = "INV-20240101-001";
    const invoiceRecord = {
      invoice_id: invoiceId,
      deal_id: dealId,
      customer_id: customerId,
      invoice_amount: 100000,
      invoice_status: "発行済み",
      issued_at: "2024-01-01T11:00:00Z",
    };

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        share_link: "https://drive.google.com/file/d/mock-file-id/view",
      }),
      generateShareLink: jest
        .fn()
        .mockResolvedValue(
          "https://drive.google.com/file/d/mock-file-id/view?expires=1704110400"
        ),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest
        .fn()
        .mockResolvedValue({ delivery_status: "sent" }),
      sendOrderNotification: jest
        .fn()
        .mockResolvedValue({ delivery_status: "sent" }),
      sendInvoiceNotification: jest
        .fn()
        .mockResolvedValue({ delivery_status: "sent" }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        message_id: "msg-mock-001",
        status: "delivered",
        opened_at: null,
      }),
    };

    const result = await verifyDealInvoiceDiscrepancy(
      dealRecord,
      invoiceRecord,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter
    );

    expect(result).toEqual({
      discrepancy_detected: true,
      deal_id: dealId,
      deal_status: "失注",
      invoice_status: "発行済み",
      severity: "error",
      message:
        "商談ステータスが失注であるにもかかわらず、請求書が発行されています。データの整合性を確認してください。",
    });

    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).not
      .toHaveBeenCalled();
  });
});