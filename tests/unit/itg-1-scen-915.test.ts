import { describe, test, expect, beforeEach } from "@jest/globals";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  let documentStorageAdapterStub: any;
  let notificationServiceAdapterStub: any;

  beforeEach(() => {
    documentStorageAdapterStub = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: "file_12345",
        fileName: "invoice_DEAL-001.pdf",
        url: "https://storage.example.com/invoices/invoice_DEAL-001.pdf",
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink:
          "https://storage.example.com/share/abc123def456",
        expiresAt: new Date("2024-01-22T23:59:59Z"),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    notificationServiceAdapterStub = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        status: "sent",
        messageId: "msg_quote_001",
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        status: "sent",
        messageId: "msg_order_001",
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        status: "sent",
        messageId: "msg_invoice_001",
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        deliveryStatus: "delivered",
        openedAt: new Date("2024-01-15T14:30:00Z"),
      }),
    };
  });

  // SCEN-915
  test("売上実績・請求データ照合機能 - 商談ステータスが「受注」で請求書が発行済みの場合、売上計上予定日と請求日が一致する", async () => {
    const { verifySalesInvoiceReconciliation } = await import(
      "../../src/logic/it-1784969823049-1-1-1"
    );

    const dealRecord = {
      dealId: "DEAL-001",
      customerName: "テスト顧客A",
      status: "受注",
      amount: 100000,
      amountFormatted: "100,000円",
      expectedRevenueDate: "2024-01-15",
    };

    const invoiceRecord = {
      invoiceId: "INV-2024-001",
      dealId: "DEAL-001",
      invoiceStatus: "発行済み",
      invoiceDate: "2024-01-15",
      amount: 100000,
      customerName: "テスト顧客A",
      generatedAt: "2024-01-15T10:00:00Z",
    };

    const reconciliationInput = {
      dealId: dealRecord.dealId,
      dealStatus: dealRecord.status,
      expectedRevenueDate: dealRecord.expectedRevenueDate,
      invoiceStatus: invoiceRecord.invoiceStatus,
      invoiceDate: invoiceRecord.invoiceDate,
      invoiceAmount: invoiceRecord.amount,
      dealAmount: dealRecord.amount,
      documentStorageAdapter: documentStorageAdapterStub,
      notificationServiceAdapter: notificationServiceAdapterStub,
    };

    const result = await verifySalesInvoiceReconciliation(reconciliationInput);

    expect(result).toEqual({
      reconciliationStatus: "一致",
      dealId: "DEAL-001",
      dealStatus: "受注",
      invoiceStatus: "発行済み",
      expectedRevenueDate: "2024-01-15",
      invoiceDate: "2024-01-15",
      amountMatch: true,
      dateMatch: true,
      hasDifference: false,
      differenceFlag: false,
    });

    expect(result.reconciliationStatus).toBe("一致");
    expect(result.expectedRevenueDate).toBe("2024-01-15");
    expect(result.invoiceDate).toBe("2024-01-15");
    expect(result.differenceFlag).toBe(false);
    expect(result.dateMatch).toBe(true);
    expect(result.amountMatch).toBe(true);
    expect(result.hasDifference).toBe(false);

    expect(notificationServiceAdapterStub.sendInvoiceNotification).toHaveBeenCalled();
    expect(documentStorageAdapterStub.uploadDocument).toHaveBeenCalled();
  });
});