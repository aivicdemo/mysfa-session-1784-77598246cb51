import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import { issueInvoiceWithTimestamp } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル - 商談情報参照機能", () => {
  // SCEN-041
  test("帳票発行時の発行日時自動付与と発行履歴記録 - 請求書を発行したとき、発行日時がシステム現在時刻で自動付与される", () => {
    // ステップ1: テストユーザーでのログイン状態をシミュレート
    const testUserId = "user-001";
    const testUserEmail = "test.user@example.com";

    // ステップ2-5: 各外部サービスのモック化
    const mockDocumentStorage = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: "doc-12345",
        storageUrl: "https://storage.example.com/doc-12345.pdf",
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: "https://drive.example.com/share/abc123",
        expiresAt: "2024-12-31T23:59:59Z",
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockNotificationService = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: "msg-67890",
        status: "sent",
      }),
      sendQuoteNotification: jest.fn().mockResolvedValue({}),
      sendOrderNotification: jest.fn().mockResolvedValue({}),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: "delivered",
        openedAt: "2024-01-15T12:30:00Z",
      }),
    };

    const mockPaymentGateway = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLinkId: "link-11111",
        paymentUrl: "https://payment.example.com/pay/link-11111",
        expiresAt: "2024-02-15T11:00:00Z",
      }),
      verifyPayment: jest.fn().mockResolvedValue({ verified: true }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        transactionId: "txn-22222",
        status: "completed",
      }),
    };

    const mockAuditLog = {
      logUserAccess: jest.fn().mockResolvedValue({ logId: "log-access-001" }),
      logDataAccess: jest.fn().mockResolvedValue({ logId: "log-data-001" }),
      logPermissionChange: jest.fn().mockResolvedValue({
        logId: "log-perm-001",
      }),
      queryAuditLog: jest.fn().mockResolvedValue({ records: [] }),
    };

    // ステップ6-7: 請求書の必須項目を入力し、システム現在時刻を記録
    const invoiceIssuanceTimestamp = new Date("2024-01-15T11:00:00Z");
    const invoiceData = {
      customerId: "customer-001",
      customerName: "Test Customer Corp",
      invoiceAmount: 150000,
      invoiceDetails: [
        {
          itemName: "Product A",
          quantity: 2,
          unitPrice: 50000,
          subtotal: 100000,
        },
        {
          itemName: "Service B",
          quantity: 1,
          unitPrice: 50000,
          subtotal: 50000,
        },
      ],
      dueDate: "2024-02-15",
    };

    // ステップ8: 「発行」ボタン押下を実行
    const invoiceIssueResult = issueInvoiceWithTimestamp(
      invoiceData,
      testUserId,
      testUserEmail,
      invoiceIssuanceTimestamp,
      {
        documentStorage: mockDocumentStorage,
        notificationService: mockNotificationService,
        paymentGateway: mockPaymentGateway,
        auditLog: mockAuditLog,
      }
    );

    // ステップ9: 請求書が正常に発行され、確認画面が表示されることを確認
    expect(invoiceIssueResult).toBeDefined();
    expect(invoiceIssueResult.status).toBe("issued");
    expect(invoiceIssueResult.invoiceId).toBeDefined();

    // ステップ10: 発行履歴から当該請求書を検索
    const invoiceHistoryRecord = invoiceIssueResult.historyRecord;

    // ステップ11-12: 記録された発行日時をアサーションで検証
    expect(invoiceHistoryRecord.issuedAt).toEqual(invoiceIssuanceTimestamp);
    expect(invoiceHistoryRecord.issuedAtTimestamp).toBe(
      1705318800000 // 2024-01-15T11:00:00Z のミリ秒タイムスタンプ
    );
    expect(invoiceHistoryRecord.invoiceStatus).toBe("issued");
    expect(invoiceHistoryRecord.invoiceNumber).toBeDefined();
    expect(invoiceHistoryRecord.customerId).toBe("customer-001");
    expect(invoiceHistoryRecord.totalAmount).toBe(150000);

    // 外部サービス呼び出しが期待通り実行されたことを確認
    expect(mockDocumentStorage.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: "customer-001",
        totalAmount: 150000,
      })
    );

    expect(mockNotificationService.sendInvoiceNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        customerEmail: testUserEmail,
        invoiceId: expect.any(String),
      })
    );

    expect(mockPaymentGateway.generatePaymentLink).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: expect.any(String),
        amount: 150000,
      })
    );

    expect(mockAuditLog.logDataAccess).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: testUserId,
        action: "invoice_issued",
      })
    );
  });
});