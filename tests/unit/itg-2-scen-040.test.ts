import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import { issueOrderDocument } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル - 商談情報参照機能", () => {
  let mockDocumentStorageAdapter: any;
  let mockAuditLogExporter: any;
  let systemNowTime: Date;

  beforeEach(() => {
    jest.clearAllMocks();
    systemNowTime = new Date("2024-01-15T14:30:45.123Z");
    jest.useFakeTimers();
    jest.setSystemTime(systemNowTime);

    mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: "doc-order-001",
        url: "https://storage.example.com/order-001.pdf",
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    mockAuditLogExporter = {
      logUserAccess: jest.fn(),
      logDataAccess: jest.fn(),
      logPermissionChange: jest.fn(),
      queryAuditLog: jest.fn(),
    };
  });

  // SCEN-040: [normal] 帳票発行時の発行日時自動付与と発行履歴記録 - 注文書を発行したとき、発行日時がシステム現在時刻で自動付与される
  test("should issue order document with system current time and record in audit log", async () => {
    const orderDocumentInput = {
      customerId: "cust-12345",
      customerName: "テスト顧客株式会社",
      items: [
        {
          productId: "prod-001",
          productName: "ソフトウェアライセンス",
          quantity: 10,
          unitPrice: 50000,
        },
      ],
      totalAmount: 500000,
      userId: "user-sales-001",
    };

    const result = await issueOrderDocument(
      orderDocumentInput,
      mockDocumentStorageAdapter,
      mockAuditLogExporter
    );

    expect(result.orderDocumentId).toBe("doc-order-001");
    expect(result.issuedAt).toEqual(new Date("2024-01-15T14:30:45.123Z"));
    expect(result.status).toBe("issued");
    expect(result.documentUrl).toBe("https://storage.example.com/order-001.pdf");

    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(1);
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        customerName: "テスト顧客株式会社",
        totalAmount: 500000,
      })
    );

    expect(mockAuditLogExporter.logDataAccess).toHaveBeenCalledTimes(1);
    expect(mockAuditLogExporter.logDataAccess).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-sales-001",
        operation: "order_document_issued",
        resourceId: "doc-order-001",
        timestamp: new Date("2024-01-15T14:30:45.123Z"),
      })
    );
  });
});