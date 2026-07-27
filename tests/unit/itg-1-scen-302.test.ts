import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";

// Mock adapters
const mockNotificationServiceAdapter = {
  sendInvoiceNotification: jest.fn(),
  sendQuoteNotification: jest.fn(),
  sendOrderNotification: jest.fn(),
  getDeliveryStatus: jest.fn(),
};

const mockDocumentStorageAdapter = {
  uploadDocument: jest.fn(),
  generateShareLink: jest.fn(),
  deleteDocument: jest.fn(),
};

// Import the function under test
import { verifyAndDisplayDealInvoiceLinkage } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-302
  test("請求書ステータスが『発行済み』のとき、紐付け対象として処理される", async () => {
    // Arrange: テスト商談と請求書を準備
    const dealId = "DEAL-001";
    const customerId = "CUST-X";
    const invoiceId = "INV-2024-001";
    const dealName = "テスト商談A";
    const customerName = "テスト顧客X";
    const dealAmount = 100000;
    const invoiceAmount = 100000;
    const issuedAtDateTime = new Date("2024-04-15T10:30:00Z");

    const dealInput = {
      dealId: dealId,
      dealName: dealName,
      customerId: customerId,
      customerName: customerName,
      amount: dealAmount,
    };

    const invoiceInput = {
      invoiceId: invoiceId,
      dealId: dealId,
      amount: invoiceAmount,
      status: "発行済み",
      issuedAt: issuedAtDateTime.toISOString(),
    };

    // Setup mock responses
    mockNotificationServiceAdapter.sendInvoiceNotification.mockResolvedValueOnce(
      {
        success: true,
        messageId: "MSG-001",
      }
    );

    const assumedDocumentUploadResponse = {
      documentId: "DOC-2024-001",
      storageUrl:
        "https://storage.example.com/invoices/INV-2024-001.pdf",
      uploadTimestamp: new Date("2024-04-15T10:30:05Z").toISOString(),
    };

    mockDocumentStorageAdapter.uploadDocument.mockResolvedValueOnce(
      assumedDocumentUploadResponse
    );

    // Act: 紐付け一覧・ダッシュボード表示と詳細確認を実行
    const result = await verifyAndDisplayDealInvoiceLinkage(
      dealInput,
      invoiceInput,
      {
        notificationServiceAdapter: mockNotificationServiceAdapter,
        documentStorageAdapter: mockDocumentStorageAdapter,
      }
    );

    // Assert: 期待結果を検証
    // 1. 紐付け請求書セクションが表示され、該当請求書1件がリスト表示される
    expect(result.linkedInvoices).toHaveLength(1);
    expect(result.linkedInvoices[0]).toEqual(
      expect.objectContaining({
        invoiceId: invoiceId,
        amount: invoiceAmount,
        status: "発行済み",
        issuedAt: issuedAtDateTime.toISOString(),
      })
    );

    // 2. ダッシュボードの『紐付け済み請求書数』が1件になる
    expect(result.dashboardMetrics.linkedInvoiceCount).toBe(1);

    // 3. 商談の『請求書ステータス』フィールドが『発行済み』として可視化される
    expect(result.dealDetails.invoiceStatus).toBe("発行済み");

    // 4. NotificationServiceAdapter.sendInvoiceNotificationが1回呼び出される
    expect(
      mockNotificationServiceAdapter.sendInvoiceNotification
    ).toHaveBeenCalledTimes(1);
    expect(
      mockNotificationServiceAdapter.sendInvoiceNotification
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: invoiceId,
        customerId: customerId,
        amount: invoiceAmount,
      })
    );

    // 5. DocumentStorageAdapter.uploadDocumentが1回呼び出される
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(1);
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: invoiceId,
        dealId: dealId,
      })
    );

    // 6. ストレージアップロード結果が記録される
    expect(result.documentUploadResult).toEqual(
      expect.objectContaining({
        documentId: "DOC-2024-001",
        storageUrl: expect.stringContaining("invoices/INV-2024-001.pdf"),
      })
    );
  });
});