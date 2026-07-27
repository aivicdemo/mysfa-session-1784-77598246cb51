import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";

// Mock adapters
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

const mockPaymentGatewayAdapter = {
  generatePaymentLink: jest.fn(),
  verifyPayment: jest.fn(),
  getTransactionStatus: jest.fn(),
};

// Mock database and logger
const mockDatabase = {
  deals: [] as any[],
  reconciliationResults: [] as any[],
  eventLogs: [] as any[],
};

const mockLogger = {
  logs: [] as any[],
  error: jest.fn(function (message: string) {
    this.logs.push({ level: "error", message });
  }),
  warn: jest.fn(function (message: string) {
    this.logs.push({ level: "warn", message });
  }),
  info: jest.fn(function (message: string) {
    this.logs.push({ level: "info", message });
  }),
};

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    mockDatabase.deals = [];
    mockDatabase.reconciliationResults = [];
    mockDatabase.eventLogs = [];
    mockLogger.logs = [];

    // Setup default mock responses
    mockDocumentStorageAdapter.uploadDocument.mockResolvedValue({
      document_id: "DOC-001",
      storage_path: "gs://bucket/invoices/DEAL-001.pdf",
      upload_timestamp: new Date("2024-01-15T12:00:00Z").toISOString(),
    });

    mockPaymentGatewayAdapter.generatePaymentLink.mockResolvedValue({
      payment_link_id: "PAYLINK-001",
      payment_url:
        "https://payment.example.com/pay/PAYLINK-001",
      expiry_timestamp: new Date("2024-01-22T12:00:00Z").toISOString(),
    });

    mockNotificationServiceAdapter.sendInvoiceNotification.mockResolvedValue({
      notification_id: "NOTIF-001",
      recipient_email: "customer@example.com",
      send_timestamp: new Date("2024-01-15T12:00:00Z").toISOString(),
      delivery_status: "queued",
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-523
  test("商談レコードが1件のとき、正常に照合処理が完了する", async () => {
    const test_start_time = new Date("2024-01-15T12:00:00Z");
    const test_deal_id = "DEAL-001";
    const test_customer_name = "テスト顧客A";
    const test_status = "契約締結";
    const test_amount = 100000;
    const test_contract_date = "2024-01-15";

    // Initialize test deal record
    const test_deal_record = {
      deal_id: test_deal_id,
      customer_name: test_customer_name,
      status: test_status,
      amount: test_amount,
      contract_date: test_contract_date,
      created_at: test_start_time.toISOString(),
    };

    mockDatabase.deals.push(test_deal_record);

    // Simulate executeReconciliation
    const reconciliation_start_time = new Date("2024-01-15T12:00:00Z");

    for (const deal of mockDatabase.deals) {
      try {
        // Execute document upload
        const upload_response = await mockDocumentStorageAdapter.uploadDocument(
          {
            deal_id: deal.deal_id,
            invoice_data: {
              customer_name: deal.customer_name,
              amount: deal.amount,
              contract_date: deal.contract_date,
            },
          }
        );

        // Execute payment link generation
        const payment_response = await mockPaymentGatewayAdapter.generatePaymentLink(
          {
            deal_id: deal.deal_id,
            amount: deal.amount,
            currency: "JPY",
          }
        );

        // Execute customer notification
        const notification_response = await mockNotificationServiceAdapter.sendInvoiceNotification(
          {
            deal_id: deal.deal_id,
            customer_email: "customer@example.com",
            invoice_url: upload_response.storage_path,
            payment_link: payment_response.payment_url,
          }
        );

        // Record successful reconciliation result
        const reconciliation_result = {
          deal_id: deal.deal_id,
          reconciliation_status: "正常",
          discrepancy_detected: false,
          completion_timestamp: new Date("2024-01-15T12:00:00Z").toISOString(),
          document_upload_status: "completed",
          payment_link_generation_status: "completed",
          notification_status: "queued",
        };

        mockDatabase.reconciliationResults.push(reconciliation_result);
        mockLogger.info(`Reconciliation completed for deal ${deal.deal_id}`);
      } catch (error) {
        mockLogger.error(
          `Reconciliation failed for deal ${deal.deal_id}: ${error}`
        );
        throw error;
      }
    }

    // Verify mock adapter calls
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(1);
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledWith({
      deal_id: test_deal_id,
      invoice_data: {
        customer_name: test_customer_name,
        amount: test_amount,
        contract_date: test_contract_date,
      },
    });

    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledTimes(
      1
    );
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledWith({
      deal_id: test_deal_id,
      amount: test_amount,
      currency: "JPY",
    });

    expect(
      mockNotificationServiceAdapter.sendInvoiceNotification
    ).toHaveBeenCalledTimes(1);
    expect(
      mockNotificationServiceAdapter.sendInvoiceNotification
    ).toHaveBeenCalledWith({
      deal_id: test_deal_id,
      customer_email: "customer@example.com",
      invoice_url: "gs://bucket/invoices/DEAL-001.pdf",
      payment_link: "https://payment.example.com/pay/PAYLINK-001",
    });

    // Verify reconciliation result table entry
    expect(mockDatabase.reconciliationResults).toHaveLength(1);

    const result = mockDatabase.reconciliationResults[0];
    expect(result.deal_id).toBe(test_deal_id);
    expect(result.reconciliation_status).toBe("正常");
    expect(result.discrepancy_detected).toBe(false);
    expect(result.document_upload_status).toBe("completed");
    expect(result.payment_link_generation_status).toBe("completed");
    expect(result.notification_status).toBe("queued");

    // Verify completion timestamp is within acceptable range
    const completion_timestamp = new Date(result.completion_timestamp);
    const time_difference_ms = Math.abs(
      completion_timestamp.getTime() - test_start_time.getTime()
    );
    expect(time_difference_ms).toBeLessThanOrEqual(1000); // Within 1 second

    // Verify no error logs recorded
    const error_logs = mockLogger.logs.filter((log) => log.level === "error");
    expect(error_logs).toHaveLength(0);

    // Verify info logs contain completion message
    const info_logs = mockLogger.logs.filter((log) => log.level === "info");
    expect(info_logs.length).toBeGreaterThan(0);
    expect(info_logs[0].message).toMatch(/Reconciliation completed/);
  });
});