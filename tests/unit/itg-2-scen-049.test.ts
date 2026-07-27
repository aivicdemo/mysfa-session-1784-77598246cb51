import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";

interface DocumentStorageAdapter {
  uploadDocument: jest.Mock;
  generateShareLink?: jest.Mock;
  deleteDocument?: jest.Mock;
}

interface NotificationServiceAdapter {
  sendOrderNotification: jest.Mock;
  sendQuoteNotification?: jest.Mock;
  sendInvoiceNotification?: jest.Mock;
  getDeliveryStatus?: jest.Mock;
}

interface AuditLogExporter {
  logDataAccess: jest.Mock;
  logUserAccess?: jest.Mock;
  logPermissionChange?: jest.Mock;
  queryAuditLog?: jest.Mock;
}

interface OrderInput {
  productName: string;
  quantity: number;
  unitPrice: number;
  customerName: string;
  deliveryAddress: string;
  issuedAt: string | null | undefined;
}

let issueOrder: (
  input: OrderInput,
  documentStorage: DocumentStorageAdapter,
  notificationService: NotificationServiceAdapter,
  auditLog: AuditLogExporter
) => Promise<{ orderId: string; issuedAt: string }>;

beforeEach(() => {
  jest.resetModules();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("顧客向けポータル - 注文書発行時の発行日時検証", () => {
  // SCEN-049
  test("発行日時が欠けている入力で注文書を発行しようとしたときは例外が発生する", async () => {
    const { issueOrder: importedIssueOrder } = await import(
      "../../src/logic/it-1784969823049-2-1-2"
    );
    issueOrder = importedIssueOrder;

    const mockDocumentStorageAdapter: DocumentStorageAdapter = {
      uploadDocument: jest.fn(),
    };

    const mockNotificationServiceAdapter: NotificationServiceAdapter = {
      sendOrderNotification: jest.fn(),
    };

    const mockAuditLogExporter: AuditLogExporter = {
      logDataAccess: jest.fn(),
    };

    const orderInput: OrderInput = {
      productName: "サーバーライセンス",
      quantity: 5,
      unitPrice: 50000,
      customerName: "テスト会社",
      deliveryAddress: "東京都渋谷区1-1-1",
      issuedAt: null,
    };

    await expect(() =>
      issueOrder(
        orderInput,
        mockDocumentStorageAdapter,
        mockNotificationServiceAdapter,
        mockAuditLogExporter
      )
    ).rejects.toThrow(/発行日時/);

    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(
      mockNotificationServiceAdapter.sendOrderNotification
    ).not.toHaveBeenCalled();
    expect(mockAuditLogExporter.logDataAccess).not.toHaveBeenCalled();
  });
});