import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";

interface DocumentStorageAdapter {
  uploadDocument(
    pdf: Buffer,
    fileName: string
  ): Promise<{ status: string; documentId: string }>;
  generateShareLink(documentId: string): Promise<string>;
  deleteDocument(documentId: string): Promise<void>;
}

interface NotificationServiceAdapter {
  sendInvoiceNotification(
    customerId: string,
    invoiceNumber: string
  ): Promise<{ status: string }>;
  sendQuoteNotification(
    customerId: string,
    quoteNumber: string
  ): Promise<{ status: string }>;
  sendOrderNotification(
    customerId: string,
    orderNumber: string
  ): Promise<{ status: string }>;
  getDeliveryStatus(messageId: string): Promise<Record<string, unknown>>;
}

interface InvoiceIssuanceRecord {
  invoiceId: string;
  customerId: string;
  invoiceAmount: number;
  invoicePeriodStart: string;
  invoicePeriodEnd: string;
  documentType: string;
  issuanceTimestamp: string;
  issuanceStatus: string;
  documentStorageId: string;
}

interface InvoiceIssuanceRequest {
  customerId: string;
  invoiceAmount: number;
  invoicePeriodStart: string;
  invoicePeriodEnd: string;
  documentType: string;
}

interface InvoiceIssuanceResponse {
  success: boolean;
  record?: InvoiceIssuanceRecord;
  message: string;
}

async function issueInvoiceAndRecordHistory(
  request: InvoiceIssuanceRequest,
  documentStorageAdapter: DocumentStorageAdapter,
  notificationServiceAdapter: NotificationServiceAdapter
): Promise<InvoiceIssuanceResponse> {
  const {
    customerId,
    invoiceAmount,
    invoicePeriodStart,
    invoicePeriodEnd,
    documentType,
  } = request;

  const issuanceTimestamp = new Date().toISOString();
  const invoiceNumber = `INV-${Date.now()}`;

  const pdfBuffer = Buffer.from(
    `Invoice ${invoiceNumber} - Amount: ${invoiceAmount}`
  );
  const fileName = `${invoiceNumber}.pdf`;

  let documentStorageId: string;
  try {
    const uploadResponse = await documentStorageAdapter.uploadDocument(
      pdfBuffer,
      fileName
    );
    if (uploadResponse.status !== "success") {
      return {
        success: false,
        message: "文書の保存に失敗しました。システム管理者に連絡してください",
      };
    }
    documentStorageId = uploadResponse.documentId;
  } catch {
    return {
      success: false,
      message: "文書の保存に失敗しました。システム管理者に連絡してください",
    };
  }

  let notificationStatus: string;
  try {
    const notificationResponse =
      await notificationServiceAdapter.sendInvoiceNotification(
        customerId,
        invoiceNumber
      );
    notificationStatus = notificationResponse.status;
    if (notificationStatus !== "sent") {
      return {
        success: false,
        message: "メール送信に失敗しました。手動で顧客に連絡してください",
      };
    }
  } catch {
    return {
      success: false,
      message: "メール送信に失敗しました。手動で顧客に連絡してください",
    };
  }

  const record: InvoiceIssuanceRecord = {
    invoiceId: invoiceNumber,
    customerId,
    invoiceAmount,
    invoicePeriodStart,
    invoicePeriodEnd,
    documentType,
    issuanceTimestamp,
    issuanceStatus: "発行済み",
    documentStorageId,
  };

  return {
    success: true,
    record,
    message: "請求書発行完了",
  };
}

describe("顧客向けポータル - 商談情報参照機能", () => {
  // SCEN-089
  test("帳票発行時の発行日時自動付与と発行履歴記録 - 請求書の発行履歴に帳票タイプが正確に記録される", async () => {
    const customerId = "TEST-CUST-001";
    const invoiceAmount = 100000;
    const invoicePeriodStart = "2024-01-01";
    const invoicePeriodEnd = "2024-01-31";
    const documentType = "Invoice";

    const documentStorageAdapterStub: DocumentStorageAdapter = {
      uploadDocument: async () => ({
        status: "success",
        documentId: "mock-doc-12345",
      }),
      generateShareLink: async () => "https://example.com/share/mock-doc-12345",
      deleteDocument: async () => undefined,
    };

    const notificationServiceAdapterStub: NotificationServiceAdapter = {
      sendInvoiceNotification: async () => ({
        status: "sent",
      }),
      sendQuoteNotification: async () => ({
        status: "sent",
      }),
      sendOrderNotification: async () => ({
        status: "sent",
      }),
      getDeliveryStatus: async () => ({
        messageId: "mock-msg-001",
        status: "delivered",
      }),
    };

    const issuanceRequest: InvoiceIssuanceRequest = {
      customerId,
      invoiceAmount,
      invoicePeriodStart,
      invoicePeriodEnd,
      documentType,
    };

    const beforeIssuanceTimestamp = new Date();
    const response = await issueInvoiceAndRecordHistory(
      issuanceRequest,
      documentStorageAdapterStub,
      notificationServiceAdapterStub
    );
    const afterIssuanceTimestamp = new Date();

    expect(response.success).toBe(true);
    expect(response.message).toBe("請求書発行完了");

    const record = response.record;
    expect(record).toBeDefined();

    expect(record!.customerId).toBe("TEST-CUST-001");
    expect(record!.invoiceAmount).toBe(100000);
    expect(record!.invoicePeriodStart).toBe("2024-01-01");
    expect(record!.invoicePeriodEnd).toBe("2024-01-31");
    expect(record!.documentType).toBe("Invoice");
    expect(record!.issuanceStatus).toBe("発行済み");
    expect(record!.documentStorageId).toBe("mock-doc-12345");

    const issuanceTimestampDate = new Date(record!.issuanceTimestamp);
    expect(issuanceTimestampDate.getTime()).toBeGreaterThanOrEqual(
      beforeIssuanceTimestamp.getTime() - 1000
    );
    expect(issuanceTimestampDate.getTime()).toBeLessThanOrEqual(
      afterIssuanceTimestamp.getTime() + 1000
    );

    expect(record!.invoiceId).toMatch(/^INV-\d+$/);
  });
});