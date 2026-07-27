import { describe, test, expect, beforeEach, jest } from "@jest/globals";

// Mocking external adapters
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

// Import the function to test
import { reconcileSalesAndInvoicing } from "../../src/logic/it-1784969823049-1-1-1";

describe("売上実績・請求状況照合機能", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDocumentStorageAdapter.uploadDocument.mockResolvedValue({
      fileId: "doc_12345",
      url: "https://drive.google.com/file/d/doc_12345",
    });
    mockNotificationServiceAdapter.sendInvoiceNotification.mockResolvedValue({
      messageId: "msg_67890",
      status: "sent",
    });
    mockPaymentGatewayAdapter.generatePaymentLink.mockResolvedValue({
      paymentUrl: "https://payment.gmo.co.jp/link/inv_001",
      expiresAt: "2024-02-15T00:00:00Z",
    });
  });

  // SCEN-956
  test("売上実績の金額が請求書の合計金額より1円多い場合、金額不整合として検出される", async () => {
    const sales_record_id = "sales_20240115_001";
    const invoice_record_id = "invoice_20240115_001";
    const transaction_id = "txn_20240115_001";
    const customer_id = "cust_A001";

    const sales_amount_yen = 10001;
    const invoice_total_amount_yen = 10000;
    const amount_difference_yen = 1;

    const sales_record = {
      id: sales_record_id,
      transaction_id: transaction_id,
      customer_id: customer_id,
      amount_yen: sales_amount_yen,
      recorded_at: "2024-01-15T10:00:00Z",
      status: "completed",
    };

    const invoice_record = {
      id: invoice_record_id,
      transaction_id: transaction_id,
      customer_id: customer_id,
      total_amount_yen: invoice_total_amount_yen,
      issued_at: "2024-01-15T11:00:00Z",
      status: "issued",
      line_items: [
        {
          description: "Product A",
          quantity: 100,
          unit_price_yen: 100,
          line_total_yen: 10000,
        },
      ],
    };

    const reconciliation_result = await reconcileSalesAndInvoicing(
      [sales_record],
      [invoice_record],
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    expect(reconciliation_result.status).toBe("discrepancy_detected");
    expect(reconciliation_result.discrepancies).toHaveLength(1);

    const discrepancy = reconciliation_result.discrepancies[0];
    expect(discrepancy.discrepancy_type).toBe("amount_mismatch");
    expect(discrepancy.sales_amount_yen).toBe(10001);
    expect(discrepancy.invoice_total_amount_yen).toBe(10000);
    expect(discrepancy.difference_amount_yen).toBe(1);
    expect(discrepancy.transaction_id).toBe(transaction_id);
    expect(discrepancy.detected_at).toBeDefined();
    expect(discrepancy.resolution_status).toBe("detected");
  });
});