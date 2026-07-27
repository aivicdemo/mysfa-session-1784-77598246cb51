import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import {
  issueInvoiceWithHistory,
  type InvoiceIssuanceInput,
  type InvoiceIssuanceOutput,
  type DocumentStorageAdapter,
  type NotificationServiceAdapter,
  type PaymentGatewayAdapter,
  type AuditLogExporter,
} from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向け専用ポータルでの商談情報参照機能", () => {
  let mockDocumentStorage: DocumentStorageAdapter;
  let mockNotificationService: NotificationServiceAdapter;
  let mockPaymentGateway: PaymentGatewayAdapter;
  let mockAuditLog: AuditLogExporter;

  let issuanceResults: InvoiceIssuanceOutput[] = [];

  beforeEach(() => {
    issuanceResults = [];

    mockDocumentStorage = {
      uploadDocument: jest.fn(async (pdfBuffer: Buffer, filename: string) => {
        return {
          documentId: `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          storagePath: `gs://invoices/${filename}`,
          uploadedAt: new Date().toISOString(),
        };
      }),
      generateShareLink: jest.fn(
        async (documentId: string, expirationHours: number) => {
          return {
            shareLink: `https://drive.google.com/file/d/${documentId}/view?usp=sharing`,
            expiresAt: new Date(Date.now() + expirationHours * 3600000).toISOString(),
          };
        }
      ),
      deleteDocument: jest.fn(async (documentId: string) => {
        return { success: true, deletedAt: new Date().toISOString() };
      }),
    };

    mockNotificationService = {
      sendQuoteNotification: jest.fn(async () => ({
        messageId: `MSG-${Date.now()}`,
        sentAt: new Date().toISOString(),
      })),
      sendOrderNotification: jest.fn(async () => ({
        messageId: `MSG-${Date.now()}`,
        sentAt: new Date().toISOString(),
      })),
      sendInvoiceNotification: jest.fn(async () => ({
        messageId: `MSG-${Date.now()}`,
        sentAt: new Date().toISOString(),
      })),
      getDeliveryStatus: jest.fn(async () => ({
        status: "delivered",
        openedAt: new Date().toISOString(),
      })),
    };

    mockPaymentGateway = {
      generatePaymentLink: jest.fn(async (invoiceId: string, amount: number) => {
        return {
          paymentLink: `https://payment.gmo.jp/link/${invoiceId}`,
          paymentId: `PAY-${invoiceId}`,
          expiresAt: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
        };
      }),
      verifyPayment: jest.fn(async (paymentId: string) => ({
        verified: true,
        completedAt: new Date().toISOString(),
      })),
      getTransactionStatus: jest.fn(async (paymentId: string) => ({
        status: "completed",
        amount: 50000,
      })),
    };

    mockAuditLog = {
      logUserAccess: jest.fn(async () => ({ logged: true })),
      logDataAccess: jest.fn(async () => ({ logged: true })),
      logPermissionChange: jest.fn(async () => ({ logged: true })),
      queryAuditLog: jest.fn(async () => ({ records: [] })),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-080
  test("[normal] 帳票発行時の発行日時自動付与と発行履歴記録 - 同じ入力で請求書を2回発行したとき、同じ結果が記録される", async () => {
    const invoiceInput: InvoiceIssuanceInput = {
      customerId: "CUST001",
      invoiceAmount: 50000,
      invoicePeriodStart: "2024-01-01",
      invoicePeriodEnd: "2024-01-31",
      remarks: "テスト請求書",
      customerEmail: "customer@example.com",
    };

    // 1回目の請求書発行
    const firstIssuanceResult = await issueInvoiceWithHistory(
      invoiceInput,
      mockDocumentStorage,
      mockNotificationService,
      mockPaymentGateway,
      mockAuditLog
    );

    issuanceResults.push(firstIssuanceResult);

    const issuedAtFirstTime = firstIssuanceResult.issuedAt;
    const invoiceIdFirstTime = firstIssuanceResult.invoiceId;
    const storagePathFirstTime = firstIssuanceResult.storagePath;

    // 1回目の検証
    expect(firstIssuanceResult.customerId).toBe("CUST001");
    expect(firstIssuanceResult.invoiceAmount).toBe(50000);
    expect(firstIssuanceResult.invoicePeriodStart).toBe("2024-01-01");
    expect(firstIssuanceResult.invoicePeriodEnd).toBe("2024-01-31");
    expect(firstIssuanceResult.remarks).toBe("テスト請求書");
    expect(firstIssuanceResult.issuedAt).toBeDefined();
    expect(firstIssuanceResult.invoiceId).toBeDefined();
    expect(firstIssuanceResult.storagePath).toBeDefined();

    // 2回目の請求書発行（同じ入力値）
    const secondIssuanceResult = await issueInvoiceWithHistory(
      invoiceInput,
      mockDocumentStorage,
      mockNotificationService,
      mockPaymentGateway,
      mockAuditLog
    );

    issuanceResults.push(secondIssuanceResult);

    const issuedAtSecondTime = secondIssuanceResult.issuedAt;
    const invoiceIdSecondTime = secondIssuanceResult.invoiceId;
    const storagePathSecondTime = secondIssuanceResult.storagePath;

    // 2回目の検証
    expect(secondIssuanceResult.customerId).toBe("CUST001");
    expect(secondIssuanceResult.invoiceAmount).toBe(50000);
    expect(secondIssuanceResult.invoicePeriodStart).toBe("2024-01-01");
    expect(secondIssuanceResult.invoicePeriodEnd).toBe("2024-01-31");
    expect(secondIssuanceResult.remarks).toBe("テスト請求書");
    expect(secondIssuanceResult.issuedAt).toBeDefined();
    expect(secondIssuanceResult.invoiceId).toBeDefined();
    expect(secondIssuanceResult.storagePath).toBeDefined();

    // 1回目と2回目の比較：業務情報は同一
    expect(firstIssuanceResult.customerId).toBe(secondIssuanceResult.customerId);
    expect(firstIssuanceResult.invoiceAmount).toBe(secondIssuanceResult.invoiceAmount);
    expect(firstIssuanceResult.invoicePeriodStart).toBe(
      secondIssuanceResult.invoicePeriodStart
    );
    expect(firstIssuanceResult.invoicePeriodEnd).toBe(secondIssuanceResult.invoicePeriodEnd);
    expect(firstIssuanceResult.remarks).toBe(secondIssuanceResult.remarks);

    // 1回目と2回目の比較：発行日時・IDは異なる
    expect(issuedAtFirstTime).not.toBe(issuedAtSecondTime);
    expect(invoiceIdFirstTime).not.toBe(invoiceIdSecondTime);
    expect(storagePathFirstTime).not.toBe(storagePathSecondTime);

    // 外部サービスが2回呼び出されたことを確認
    expect(mockDocumentStorage.uploadDocument).toHaveBeenCalledTimes(2);
    expect(mockNotificationService.sendInvoiceNotification).toHaveBeenCalledTimes(2);
    expect(mockPaymentGateway.generatePaymentLink).toHaveBeenCalledTimes(2);
    expect(mockAuditLog.logDataAccess).toHaveBeenCalledTimes(2);

    // 発行履歴が記録されていることを確認
    expect(issuanceResults).toHaveLength(2);
    expect(issuanceResults[0].invoiceId).not.toBe(issuanceResults[1].invoiceId);
  });
});