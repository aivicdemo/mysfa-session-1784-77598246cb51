import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import type { DealRecord, InvoiceData, AmountDiscrepancyResult } from "../../src/logic/it-1784969823049-1-1-1";
import { detectAmountDiscrepancy } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  let mockDocumentStorageAdapter: any;
  let mockNotificationServiceAdapter: any;

  beforeEach(() => {
    mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: "doc-276-001",
        fileName: "invoice_276.pdf",
        sharedLink: "https://drive.example.com/share/doc-276-001",
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        link: "https://drive.example.com/share/doc-276-001",
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: "msg-quote-001",
        status: "sent",
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        messageId: "msg-order-001",
        status: "sent",
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: "msg-invoice-001",
        status: "sent",
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: "delivered",
        openedAt: "2024-01-15T12:30:00Z",
      }),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-276: [normal] 商談ステータスと請求データの紐付け・可視化 - 商談ステータスが『受注』に更新されたとき、請求金額が商談金額より低い場合、金額ズレが検出される
  test("should detect amount discrepancy when invoice amount is lower than deal amount after status update to Won", async () => {
    const dealRecord: DealRecord = {
      dealId: "DEAL-276-001",
      dealName: "テスト商談276",
      dealAmount: 1000000,
      status: "Won",
      customerId: "CUST-276-001",
      customerName: "テスト顧客276",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T11:30:00Z",
    };

    const invoiceData: InvoiceData = {
      invoiceId: "INV-276-001",
      dealId: "DEAL-276-001",
      invoiceAmount: 900000,
      invoiceDate: "2024-01-15T11:30:00Z",
      dueDate: "2024-02-15T00:00:00Z",
      status: "Issued",
    };

    const discrepancyResult: AmountDiscrepancyResult = detectAmountDiscrepancy(
      dealRecord,
      invoiceData,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter
    );

    expect(discrepancyResult.hasDiscrepancy).toBe(true);
    expect(discrepancyResult.discrepancyType).toBe("amount_mismatch");
    expect(discrepancyResult.dealAmount).toBe(1000000);
    expect(discrepancyResult.invoiceAmount).toBe(900000);
    expect(discrepancyResult.discrepancyAmount).toBe(100000);
    expect(discrepancyResult.discrepancyPercentage).toBe(10.0);
    expect(discrepancyResult.warningMessage).toMatch(/金額ズレを検出/);
    expect(discrepancyResult.displayText).toMatch(/商談金額: 1,000,000円/);
    expect(discrepancyResult.displayText).toMatch(/請求金額: 900,000円/);
    expect(discrepancyResult.displayText).toMatch(/ズレ額: 100,000円/);
    expect(discrepancyResult.displayText).toMatch(/10\.0%/);
    expect(discrepancyResult.highlightColor).toBe("warning");
    expect(discrepancyResult.detailsAvailable).toBe(true);
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalled();
  });
});