import { detectBillingDiscrepancy } from "../../src/logic/it-1784969823049-1-1-1";

const mockDocumentStorageAdapter = {
  uploadDocument: jest.fn().mockResolvedValue({
    documentId: "DOC-001",
    uploadedAt: "2024-01-16T10:00:00Z",
  }),
  generateShareLink: jest.fn(),
  deleteDocument: jest.fn(),
};

const mockNotificationServiceAdapter = {
  sendInvoiceNotification: jest
    .fn()
    .mockResolvedValue({ notificationId: "NOTIF-001", sentAt: "2024-01-16T10:00:00Z" }),
  sendQuoteNotification: jest.fn(),
  sendOrderNotification: jest.fn(),
  getDeliveryStatus: jest.fn(),
};

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-625
  test("商談ステータスが『受注』で請求書発行日が商談クローズ日より1日遅いとき、1日のズレと検出される", () => {
    const dealData = {
      dealId: "DEAL-001",
      customerName: "テスト顧客A",
      dealStatus: "受注",
      closeDate: new Date("2024-01-15T00:00:00Z"),
    };

    const invoiceData = {
      invoiceId: "INV-001",
      relatedDealId: "DEAL-001",
      invoiceIssueDate: new Date("2024-01-16T00:00:00Z"),
    };

    const result = detectBillingDiscrepancy(
      dealData,
      invoiceData,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter
    );

    expect(result.detectionStatus).toBe("ズレあり");
    expect(result.discrepancyType).toBe("発行日遅延");
    expect(result.discrepancyDays).toBe(1);
    expect(result.dealStatus).toBe("受注");
    expect(result.dealCloseDate).toEqual(new Date("2024-01-15T00:00:00Z"));
    expect(result.invoiceIssueDate).toEqual(new Date("2024-01-16T00:00:00Z"));
    expect(result.detailMessage).toBe(
      "請求書発行日が商談クローズ日より1日遅延しています"
    );
  });
});