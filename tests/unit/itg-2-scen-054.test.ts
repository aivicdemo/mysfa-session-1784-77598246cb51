import { issueQuote } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータルでの商談情報参照機能 - 見積書発行時の検証", () => {
  test("SCEN-054: 顧客IDが欠けている入力で見積書を発行しようとしたときは例外が発生する", () => {
    // Arrange
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

    const mockAuditLogExporter = {
      logUserAccess: jest.fn(),
      logDataAccess: jest.fn(),
      logPermissionChange: jest.fn(),
      queryAuditLog: jest.fn(),
    };

    const quoteInput = {
      customerId: "",
      productName: "システム導入コンサルティング",
      quantity: 1,
      unitPrice: 500000,
      validityDays: 30,
      salesUserId: "SALES-001",
      sessionToken: "valid-session-token-12345",
    };

    // Act & Assert
    expect(() =>
      issueQuote(
        quoteInput,
        mockDocumentStorageAdapter,
        mockNotificationServiceAdapter,
        mockAuditLogExporter
      )
    ).toThrow(/顧客ID/);

    // Assert: 外部サービスが呼び出されていないことを確認
    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(
      mockNotificationServiceAdapter.sendQuoteNotification
    ).not.toHaveBeenCalled();

    // Assert: 監査ログには失敗イベントが記録されていることを確認
    expect(mockAuditLogExporter.logDataAccess).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: "QUOTE_ISSUE_FAILED",
        userId: "SALES-001",
        reason: expect.stringMatching(/顧客ID/),
      })
    );
  });
});