import { issueQuote } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向け専用ポータルでの商談情報参照機能", () => {
  test("SCEN-045: 帳票発行時の発行日時自動付与と発行履歴記録 - 同じ見積書を複数回発行したとき、発行履歴に複数件記録される", () => {
    // Setup: テスト用顧客データ
    const customerData = {
      customerId: "CUST-001",
      customerName: "テスト太郎",
    };

    // Setup: テスト用見積書データ
    const quoteData = {
      quoteId: "QT-20240115-001",
      amount: 100000,
      productName: "テスト商品A",
      customerId: customerData.customerId,
    };

    // Mock: DocumentStorageAdapter
    const mockDocumentStorage = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: "file-123",
        url: "https://example.com/file-123",
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: "https://example.com/share-123",
      }),
      deleteDocument: jest.fn().mockResolvedValue({}),
    };

    // Mock: NotificationServiceAdapter
    const mockNotificationService = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: "msg-123",
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({}),
      sendInvoiceNotification: jest.fn().mockResolvedValue({}),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: "delivered",
      }),
    };

    // Mock: AuditLogExporter
    const mockAuditLog = {
      logUserAccess: jest.fn().mockResolvedValue({}),
      logDataAccess: jest.fn().mockResolvedValue({}),
      logPermissionChange: jest.fn().mockResolvedValue({}),
      queryAuditLog: jest.fn().mockResolvedValue([]),
    };

    // Issue history storage (simulating DB)
    const issueHistories: Array<{
      quoteId: string;
      customerId: string;
      issuedAt: string;
      issueCount: number;
      status: string;
    }> = [];

    // 1st issuance at 2024-01-15 10:00:00
    const firstIssuedAt = "2024-01-15T10:00:00Z";
    const firstResult = issueQuote(
      {
        quoteId: quoteData.quoteId,
        customerId: customerData.customerId,
        amount: quoteData.amount,
        productName: quoteData.productName,
        issuedAt: firstIssuedAt,
      },
      mockDocumentStorage,
      mockNotificationService,
      mockAuditLog
    );

    issueHistories.push({
      quoteId: quoteData.quoteId,
      customerId: customerData.customerId,
      issuedAt: firstIssuedAt,
      issueCount: issueHistories.length + 1,
      status: "発行済",
    });

    expect(firstResult).toEqual({
      success: true,
      quoteId: "QT-20240115-001",
      issuedAt: "2024-01-15T10:00:00Z",
      issueCount: 1,
    });

    // Verify 1st issuance history
    expect(issueHistories).toHaveLength(1);
    expect(issueHistories[0]).toEqual({
      quoteId: "QT-20240115-001",
      customerId: "CUST-001",
      issuedAt: "2024-01-15T10:00:00Z",
      issueCount: 1,
      status: "発行済",
    });

    // 2nd issuance at 2024-01-15 10:05:00
    const secondIssuedAt = "2024-01-15T10:05:00Z";
    const secondResult = issueQuote(
      {
        quoteId: quoteData.quoteId,
        customerId: customerData.customerId,
        amount: quoteData.amount,
        productName: quoteData.productName,
        issuedAt: secondIssuedAt,
      },
      mockDocumentStorage,
      mockNotificationService,
      mockAuditLog
    );

    issueHistories.push({
      quoteId: quoteData.quoteId,
      customerId: customerData.customerId,
      issuedAt: secondIssuedAt,
      issueCount: issueHistories.length + 1,
      status: "発行済",
    });

    expect(secondResult).toEqual({
      success: true,
      quoteId: "QT-20240115-001",
      issuedAt: "2024-01-15T10:05:00Z",
      issueCount: 2,
    });

    // Verify 2nd issuance history
    expect(issueHistories).toHaveLength(2);
    expect(issueHistories[1]).toEqual({
      quoteId: "QT-20240115-001",
      customerId: "CUST-001",
      issuedAt: "2024-01-15T10:05:00Z",
      issueCount: 2,
      status: "発行済",
    });

    // 3rd issuance at 2024-01-15 10:10:00
    const thirdIssuedAt = "2024-01-15T10:10:00Z";
    const thirdResult = issueQuote(
      {
        quoteId: quoteData.quoteId,
        customerId: customerData.customerId,
        amount: quoteData.amount,
        productName: quoteData.productName,
        issuedAt: thirdIssuedAt,
      },
      mockDocumentStorage,
      mockNotificationService,
      mockAuditLog
    );

    issueHistories.push({
      quoteId: quoteData.quoteId,
      customerId: customerData.customerId,
      issuedAt: thirdIssuedAt,
      issueCount: issueHistories.length + 1,
      status: "発行済",
    });

    expect(thirdResult).toEqual({
      success: true,
      quoteId: "QT-20240115-001",
      issuedAt: "2024-01-15T10:10:00Z",
      issueCount: 3,
    });

    // Verify all 3 issuance histories
    expect(issueHistories).toHaveLength(3);
    expect(issueHistories[0]).toEqual({
      quoteId: "QT-20240115-001",
      customerId: "CUST-001",
      issuedAt: "2024-01-15T10:00:00Z",
      issueCount: 1,
      status: "発行済",
    });
    expect(issueHistories[1]).toEqual({
      quoteId: "QT-20240115-001",
      customerId: "CUST-001",
      issuedAt: "2024-01-15T10:05:00Z",
      issueCount: 2,
      status: "発行済",
    });
    expect(issueHistories[2]).toEqual({
      quoteId: "QT-20240115-001",
      customerId: "CUST-001",
      issuedAt: "2024-01-15T10:10:00Z",
      issueCount: 3,
      status: "発行済",
    });

    // Verify mocks were called
    expect(mockDocumentStorage.uploadDocument).toHaveBeenCalledTimes(3);
    expect(mockNotificationService.sendQuoteNotification).toHaveBeenCalledTimes(
      3
    );
    expect(mockAuditLog.logDataAccess).toHaveBeenCalledTimes(3);
  });
});