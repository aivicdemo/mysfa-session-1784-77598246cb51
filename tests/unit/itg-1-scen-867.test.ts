import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { verifyInvoiceApproval } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け - 請求書承認検証機能", () => {
  // SCEN-867: [edge] 請求書承認検証機能 - 請求書の発行日が月末のとき検証が合格する
  it("should pass approval validation when invoice issue date is at month end", async () => {
    // Mock DocumentStorageAdapter
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: "doc_12345",
        url: "https://drive.example.com/files/doc_12345",
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: "https://drive.example.com/share/abc123xyz",
        expiresAt: new Date("2024-02-28T23:59:59Z").toISOString(),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // Mock NotificationServiceAdapter
    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: "msg_quote_001",
        status: "sent",
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        messageId: "msg_order_001",
        status: "sent",
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: "msg_invoice_001",
        status: "sent",
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        deliveryStatus: "delivered",
        openedAt: new Date("2024-02-28T14:30:00Z").toISOString(),
      }),
    };

    // Mock PaymentGatewayAdapter
    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLinkId: "plink_67890",
        paymentUrl: "https://payment.example.com/invoice/inv_001",
        expiresAt: new Date("2024-03-10T23:59:59Z").toISOString(),
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        transactionId: "txn_abc123",
        status: "completed",
        amountPaid: 150000,
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        transactionId: "txn_abc123",
        status: "completed",
        amount: 150000,
      }),
    };

    // Create invoice data with month-end issue date (February 28, 2024)
    const invoiceData = {
      invoiceId: "INV-2024-002-001",
      customerId: "CUST-00001",
      customerName: "株式会社サンプル",
      customerEmail: "contact@sample.com",
      issueDate: "2024-02-28",
      dueDate: "2024-03-31",
      amount: 150000,
      currency: "JPY",
      details: [
        {
          lineItemId: "LI-001",
          description: "コンサルティングサービス",
          quantity: 5,
          unitPrice: 30000,
          subtotal: 150000,
        },
      ],
      invoiceNumber: "2024-002-001",
      status: "draft",
      dealId: "DEAL-2024-0042",
    };

    // Execute invoice approval verification
    const result = await verifyInvoiceApproval(invoiceData, {
      documentStorageAdapter: mockDocumentStorageAdapter,
      notificationServiceAdapter: mockNotificationServiceAdapter,
      paymentGatewayAdapter: mockPaymentGatewayAdapter,
    });

    // Assert: Verification should pass with "approved" or "validation_success" status
    expect(result.validationStatus).toBe("approved");
    expect(result.isApproved).toBe(true);
    expect(result.errors).toEqual([]);

    // Assert: DocumentStorageAdapter methods should be called at least once
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(1);
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: "INV-2024-002-001",
        content: expect.any(String),
      })
    );

    // Assert: NotificationServiceAdapter.sendInvoiceNotification should be called
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalledTimes(
      1
    );
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: "INV-2024-002-001",
        recipientEmail: "contact@sample.com",
      })
    );

    // Assert: PaymentGatewayAdapter.generatePaymentLink should be called
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledTimes(1);
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: "INV-2024-002-001",
        amount: 150000,
      })
    );

    // Assert: Verification completed successfully without validation errors
    expect(result.completedAt).toBeDefined();
    expect(typeof result.completedAt).toBe("string");
  });
});