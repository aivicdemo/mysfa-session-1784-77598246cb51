import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-690
  test("月次決算期限3営業日前に照合開始時、商談ステータスは初期段階だが請求書が発行されている案件は遅延として検出される", async () => {
    // Arrange
    const today = new Date("2024-01-15T09:00:00Z");
    const monthlyDeadline = new Date("2024-01-31T17:00:00Z");
    const threeBusinessDaysBefore = new Date("2024-01-24T09:00:00Z");

    // Mock DocumentStorageAdapter
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: "doc-001",
        uploadedAt: today.toISOString(),
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    // Mock NotificationServiceAdapter
    const mockNotificationServiceAdapter = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        notificationId: "notif-001",
        sentAt: today.toISOString(),
      }),
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    // Test deal data
    const dealA = {
      dealId: "DEAL-001",
      customerId: "CUST-TEST-001",
      customerName: "テスト顧客001",
      status: "初期段階",
      amount: 500000,
      createdAt: new Date("2024-01-10T10:00:00Z").toISOString(),
    };

    // Test invoice data
    const invoiceA = {
      invoiceId: "INV-001",
      dealId: "DEAL-001",
      customerId: "CUST-TEST-001",
      amount: 500000,
      status: "発行済",
      issuedDate: today.toISOString(),
      createdAt: today.toISOString(),
    };

    // Import the function
    const { detectDiscrepanciesBetweenDealAndInvoice } = await import(
      "../../src/logic/it-1784969823049-1-1-1"
    );

    // Act
    const reconciliationResult = await detectDiscrepanciesBetweenDealAndInvoice({
      reconciliationDate: threeBusinessDaysBefore,
      deals: [dealA],
      invoices: [invoiceA],
      documentStorageAdapter: mockDocumentStorageAdapter,
      notificationServiceAdapter: mockNotificationServiceAdapter,
      monthlyDeadline: monthlyDeadline,
    });

    // Assert
    expect(reconciliationResult).toBeDefined();
    expect(reconciliationResult.discrepancies).toHaveLength(1);

    const detectedDiscrepancy = reconciliationResult.discrepancies[0];
    expect(detectedDiscrepancy.dealId).toBe("DEAL-001");
    expect(detectedDiscrepancy.invoiceId).toBe("INV-001");
    expect(detectedDiscrepancy.discrepancyType).toBe(
      "ステータスと請求書発行のズレ"
    );
    expect(detectedDiscrepancy.detail).toContain("初期段階");
    expect(detectedDiscrepancy.detail).toContain("INV-001");
    expect(detectedDiscrepancy.detail).toContain("発行済");
    expect(detectedDiscrepancy.severity).toBe("高");
    expect(detectedDiscrepancy.detectedAt).toBeDefined();
    expect(detectedDiscrepancy.status).toBe("未対応");

    // Verify the detected timestamp is set to the reconciliation date
    const detectedAtDate = new Date(detectedDiscrepancy.detectedAt);
    expect(detectedAtDate.toISOString()).toBe(threeBusinessDaysBefore.toISOString());

    // Verify that the document storage and notification adapters were called appropriately
    expect(mockDocumentStorageAdapter.uploadDocument).toBeCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toBeCalled();
  });
});