import { issueInvoiceWithTimestamp } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル - 商談情報参照機能", () => {
  // SCEN-068: [edge] 帳票発行時の発行日時自動付与と発行履歴記録 - 請求書の発行日時が月末のとき、その日時が正確に記録される
  test("should record invoice issuance timestamp accurately when issued at month-end", async () => {
    // Arrange
    const month_end_timestamp = new Date("2024-01-31T23:59:59Z");
    const customer_id = "CUST-001";
    const invoice_amount = 150000;
    const invoice_description = "Monthly subscription service";

    const mock_document_storage = {
      uploadDocument: jest.fn().mockResolvedValue({
        document_id: "DOC-2024-001",
        storage_path: "gs://invoices/2024/INV-001.pdf",
        uploaded_at: month_end_timestamp.toISOString(),
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        share_link: "https://drive.google.com/file/d/abc123",
        link_expires_at: new Date(
          month_end_timestamp.getTime() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      }),
      deleteDocument: jest.fn().mockResolvedValue({}),
    };

    const mock_notification_service = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        notification_id: "NOTIF-001",
        sent_at: month_end_timestamp.toISOString(),
        status: "delivered",
      }),
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const mock_payment_gateway = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        payment_link: "https://payment.gmo.co.jp/link/INV-001",
        link_id: "LINK-2024-001",
        expires_at: new Date(
          month_end_timestamp.getTime() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
      }),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    // Override system time for this test
    jest
      .useFakeTimers()
      .setSystemTime(new Date("2024-01-31T23:59:59Z"));

    const issue_input = {
      customer_id,
      invoice_amount,
      invoice_description,
      issued_by_user_id: "USER-123",
    };

    // Act
    const result = await issueInvoiceWithTimestamp(issue_input, {
      document_storage: mock_document_storage,
      notification_service: mock_notification_service,
      payment_gateway: mock_payment_gateway,
    });

    // Assert
    expect(result.invoice_id).toBeDefined();
    expect(result.issued_at).toBe("2024-01-31T23:59:59.000Z");
    expect(result.issued_at_iso_format).toBe("2024-01-31T23:59:59Z");
    expect(result.customer_id).toBe(customer_id);
    expect(result.invoice_amount).toBe(invoice_amount);

    // Verify DocumentStorageAdapter was called with correct timestamp
    expect(mock_document_storage.uploadDocument).toHaveBeenCalledTimes(1);
    const upload_call_args = mock_document_storage.uploadDocument.mock
      .calls[0][0];
    expect(upload_call_args.pdf_metadata.generated_at).toBe(
      "2024-01-31T23:59:59.000Z"
    );
    expect(upload_call_args.pdf_metadata.generated_at_iso_format).toBe(
      "2024-01-31T23:59:59Z"
    );

    // Verify NotificationServiceAdapter was called
    expect(mock_notification_service.sendInvoiceNotification).toHaveBeenCalledTimes(
      1
    );
    const notification_call_args =
      mock_notification_service.sendInvoiceNotification.mock.calls[0][0];
    expect(notification_call_args.invoice_issued_at).toBe(
      "2024-01-31T23:59:59.000Z"
    );

    // Verify PaymentGatewayAdapter was called
    expect(mock_payment_gateway.generatePaymentLink).toHaveBeenCalledTimes(1);
    const payment_call_args =
      mock_payment_gateway.generatePaymentLink.mock.calls[0][0];
    expect(payment_call_args.invoice_issued_at).toBe(
      "2024-01-31T23:59:59.000Z"
    );

    // Verify issue history record
    expect(result.issue_history).toBeDefined();
    expect(result.issue_history.issued_at).toBe("2024-01-31T23:59:59.000Z");
    expect(result.issue_history.issued_at_iso_format).toBe("2024-01-31T23:59:59Z");
    expect(result.issue_history.month_end_edge_case).toBe(true);
    expect(result.issue_history.timestamp_precision_preserved).toBe(true);

    jest.useRealTimers();
  });
});