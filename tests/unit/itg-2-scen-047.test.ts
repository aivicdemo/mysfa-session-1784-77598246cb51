import { issueInvoiceWithHistoryTracking } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル商談情報参照機能", () => {
  // SCEN-047: [normal] 帳票発行時の発行日時自動付与と発行履歴記録 - 同じ請求書を複数回発行したとき、発行履歴に複数件記録される
  test("同じ請求書を複数回発行した場合、発行履歴に複数件のレコードが時系列順に記録される", () => {
    // Arrange
    const invoiceId = "INV-20240115-001";
    const userId = "USER-001";
    const userName = "営業太郎";
    const firstIssuanceTimestamp = new Date("2024-01-15T10:00:00Z");
    const secondIssuanceTimestamp = new Date("2024-01-15T10:05:00Z");

    const mockDocumentStorageAdapter = {
      uploadDocument: jest
        .fn()
        .mockResolvedValueOnce({
          documentId: "DOC-20240115-001",
          uploadedAt: firstIssuanceTimestamp.toISOString(),
        })
        .mockResolvedValueOnce({
          documentId: "DOC-20240115-002",
          uploadedAt: secondIssuanceTimestamp.toISOString(),
        }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const mockNotificationServiceAdapter = {
      sendInvoiceNotification: jest
        .fn()
        .mockResolvedValueOnce({ status: "sent", timestamp: firstIssuanceTimestamp.toISOString() })
        .mockResolvedValueOnce({ status: "sent", timestamp: secondIssuanceTimestamp.toISOString() }),
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const userSession = {
      userId: userId,
      userName: userName,
      isAuthenticated: true,
      sessionToken: "valid-session-token-123",
    };

    // Act - First issuance
    const firstIssuanceResult = issueInvoiceWithHistoryTracking(
      invoiceId,
      userSession,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      firstIssuanceTimestamp
    );

    // Act - Second issuance
    const secondIssuanceResult = issueInvoiceWithHistoryTracking(
      invoiceId,
      userSession,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      secondIssuanceTimestamp
    );

    // Assert - First issuance success
    expect(firstIssuanceResult.success).toBe(true);
    expect(firstIssuanceResult.issuanceHistory).toHaveLength(1);

    const firstRecord = firstIssuanceResult.issuanceHistory[0];
    expect(firstRecord.invoiceId).toBe(invoiceId);
    expect(firstRecord.userId).toBe(userId);
    expect(firstRecord.userName).toBe(userName);
    expect(firstRecord.documentId).toBe("DOC-20240115-001");
    expect(new Date(firstRecord.issuedAt).getTime()).toEqual(firstIssuanceTimestamp.getTime());

    // Assert - Second issuance success
    expect(secondIssuanceResult.success).toBe(true);
    expect(secondIssuanceResult.issuanceHistory).toHaveLength(2);

    const secondRecord = secondIssuanceResult.issuanceHistory[1];
    expect(secondRecord.invoiceId).toBe(invoiceId);
    expect(secondRecord.userId).toBe(userId);
    expect(secondRecord.userName).toBe(userName);
    expect(secondRecord.documentId).toBe("DOC-20240115-002");
    expect(new Date(secondRecord.issuedAt).getTime()).toEqual(secondIssuanceTimestamp.getTime());

    // Assert - Chronological order and uniqueness
    expect(secondIssuanceResult.issuanceHistory[0].issuedAt).toBe(firstIssuanceResult.issuanceHistory[0].issuedAt);
    expect(new Date(secondIssuanceResult.issuanceHistory[1].issuedAt).getTime()).toBeGreaterThan(
      new Date(secondIssuanceResult.issuanceHistory[0].issuedAt).getTime()
    );

    // Assert - Document IDs are different
    expect(secondIssuanceResult.issuanceHistory[0].documentId).not.toBe(
      secondIssuanceResult.issuanceHistory[1].documentId
    );

    // Assert - Mock adapter calls
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(2);
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalledTimes(2);
  });
});