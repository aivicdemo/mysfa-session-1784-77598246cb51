import { jest } from "@jest/globals";

// Mock types for external service adapters
interface DocumentStorageAdapterMock {
  uploadDocument: jest.Mock;
  generateShareLink: jest.Mock;
  deleteDocument: jest.Mock;
}

interface NotificationServiceAdapterMock {
  sendQuoteNotification: jest.Mock;
  sendOrderNotification: jest.Mock;
  sendInvoiceNotification: jest.Mock;
  getDeliveryStatus: jest.Mock;
}

interface IdentityProviderAdapterMock {
  authenticateUser: jest.Mock;
  validateToken: jest.Mock;
  refreshToken: jest.Mock;
  revokeSession: jest.Mock;
}

interface AuditLogExporterMock {
  logUserAccess: jest.Mock;
  logDataAccess: jest.Mock;
  logPermissionChange: jest.Mock;
  queryAuditLog: jest.Mock;
}

// Import the logic function under test
import { issueQuote } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル - 帳票発行機能", () => {
  // SCEN-072
  test("帳票発行時の発行日時自動付与と発行履歴記録 - 見積書の発行日時が年をまたぐとき、その日時が正確に記録される", async () => {
    // Set system time to 2024-12-31 23:59:58
    const beforeYearChangeTime = new Date("2024-12-31T23:59:58Z");
    jest.useFakeTimers();
    jest.setSystemTime(beforeYearChangeTime);

    // Create mock adapters
    const documentStorageAdapter: DocumentStorageAdapterMock = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: "doc-uuid-12345",
        uploadedUrl: "https://storage.example.com/quotes/doc-uuid-12345.pdf",
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const notificationServiceAdapter: NotificationServiceAdapterMock = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: "msg-uuid-67890",
        deliveryStatus: "sent",
      }),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const identityProviderAdapter: IdentityProviderAdapterMock = {
      authenticateUser: jest.fn().mockResolvedValue({
        accessToken: "token-xyz-123",
        tokenType: "Bearer",
        expiresIn: 3600,
      }),
      validateToken: jest.fn().mockResolvedValue({ valid: true, userId: "cust-user-001" }),
      refreshToken: jest.fn(),
      revokeSession: jest.fn(),
    };

    const auditLogExporter: AuditLogExporterMock = {
      logUserAccess: jest.fn().mockResolvedValue({}),
      logDataAccess: jest.fn().mockResolvedValue({}),
      logPermissionChange: jest.fn(),
      queryAuditLog: jest.fn(),
    };

    // Prepare input: quote with customer and product information
    const quoteInput = {
      customerId: "cust-001",
      customerName: "Test Customer Inc.",
      customerEmail: "buyer@example.com",
      dealId: "deal-001",
      products: [
        {
          productId: "prod-101",
          productName: "Service A",
          quantity: 2,
          unitPrice: 50000,
        },
        {
          productId: "prod-102",
          productName: "Service B",
          quantity: 1,
          unitPrice: 30000,
        },
      ],
      notes: "Valid until 2025-01-31",
      userId: "cust-user-001",
    };

    // Verify quote before year change was issued
    const quoteBeforeYearChange = await issueQuote(
      quoteInput,
      documentStorageAdapter,
      notificationServiceAdapter,
      identityProviderAdapter,
      auditLogExporter
    );

    // Verify issued_at is recorded before year change
    expect(quoteBeforeYearChange.issuedAt).toEqual(new Date("2024-12-31T23:59:58Z"));

    // Verify DocumentStorageAdapter was called with correct metadata
    expect(documentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: expect.stringContaining("quote"),
        metadata: expect.objectContaining({
          issuedDateTime: "2024-12-31T23:59:58Z",
          customerId: "cust-001",
        }),
      })
    );

    // Verify NotificationServiceAdapter was called with correct payload
    expect(notificationServiceAdapter.sendQuoteNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientEmail: "buyer@example.com",
        payload: expect.objectContaining({
          issuedDateTime: "2024-12-31T23:59:58Z",
          customerName: "Test Customer Inc.",
        }),
      })
    );

    // Reset mocks for the year-crossing test
    documentStorageAdapter.uploadDocument.mockClear();
    notificationServiceAdapter.sendQuoteNotification.mockClear();
    documentStorageAdapter.uploadDocument.mockResolvedValue({
      documentId: "doc-uuid-54321",
      uploadedUrl: "https://storage.example.com/quotes/doc-uuid-54321.pdf",
    });
    notificationServiceAdapter.sendQuoteNotification.mockResolvedValue({
      messageId: "msg-uuid-98765",
      deliveryStatus: "sent",
    });

    // Advance system time to 2025-01-01 00:00:02 (year boundary crossing)
    const afterYearChangeTime = new Date("2025-01-01T00:00:02Z");
    jest.setSystemTime(afterYearChangeTime);

    // Issue quote after year change
    const quoteAfterYearChange = await issueQuote(
      quoteInput,
      documentStorageAdapter,
      notificationServiceAdapter,
      identityProviderAdapter,
      auditLogExporter
    );

    // ASSERTION 1: Verify issued_at in history table is exactly 2025-01-01T00:00:02Z
    expect(quoteAfterYearChange.issuedAt).toEqual(new Date("2025-01-01T00:00:02Z"));

    // ASSERTION 2: Verify DocumentStorageAdapter.uploadDocument received correct issuedDateTime
    expect(documentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: expect.stringContaining("quote"),
        metadata: expect.objectContaining({
          issuedDateTime: "2025-01-01T00:00:02Z",
          customerId: "cust-001",
        }),
      })
    );

    // ASSERTION 3: Verify NotificationServiceAdapter.sendQuoteNotification received correct issuedDateTime
    expect(notificationServiceAdapter.sendQuoteNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientEmail: "buyer@example.com",
        payload: expect.objectContaining({
          issuedDateTime: "2025-01-01T00:00:02Z",
          customerName: "Test Customer Inc.",
        }),
      })
    );

    // Verify detailed quote display contains new year timestamp
    expect(quoteAfterYearChange.displayIssuedAt).toBe("2025-01-01T00:00:02Z");

    // Verify no caching or stale timestamp issues
    expect(quoteAfterYearChange.issuedAt.getFullYear()).toBe(2025);
    expect(quoteAfterYearChange.issuedAt.getMonth()).toBe(0); // January
    expect(quoteAfterYearChange.issuedAt.getDate()).toBe(1);
    expect(quoteAfterYearChange.issuedAt.getHours()).toBe(0);
    expect(quoteAfterYearChange.issuedAt.getMinutes()).toBe(0);
    expect(quoteAfterYearChange.issuedAt.getSeconds()).toBe(2);

    jest.useRealTimers();
  });
});