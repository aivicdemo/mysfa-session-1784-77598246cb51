import { describe, test, expect, beforeEach } from "@jest/globals";
import { approveInvoiceWithValidation } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  // SCEN-851: [normal] 請求書承認検証機能 - 請求明細に重複する商品・サービスが含まれるとき検証が合格する
  test("SCEN-851: 請求明細に重複する商品・サービスが含まれる場合、承認検証が合格する", () => {
    const invoice_id = "INV-2024-001";
    const customer_id = "CUST-001";
    const customer_name = "テスト顧客";
    const customer_email = "test@example.com";

    const invoice_details = [
      {
        product_id: "PROD-001",
        product_name: "商品A",
        quantity: 2,
        unit_price: 10000,
        line_total: 20000,
      },
      {
        product_id: "PROD-001",
        product_name: "商品A",
        quantity: 2,
        unit_price: 10000,
        line_total: 20000,
      },
      {
        product_id: "PROD-002",
        product_name: "商品B",
        quantity: 1,
        unit_price: 15000,
        line_total: 15000,
      },
    ];

    const total_amount = 55000;
    const invoice_date = "2024-01-15";
    const due_date = "2024-02-15";

    const mock_document_storage_adapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        document_id: "DOC-2024-001",
        storage_path: "gs://bucket/invoices/INV-2024-001.pdf",
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        share_link:
          "https://drive.google.com/file/d/1ABC123/view?usp=sharing",
        expiration_time: "2024-02-15T23:59:59Z",
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const mock_notification_service_adapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        message_id: "MSG-001",
        delivery_status: "sent",
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        message_id: "MSG-002",
        delivery_status: "sent",
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        message_id: "MSG-003",
        delivery_status: "sent",
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        message_id: "MSG-003",
        delivery_status: "delivered",
        opened_at: "2024-01-15T12:00:00Z",
      }),
    };

    const mock_payment_gateway_adapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        payment_link_id: "PL-2024-001",
        payment_url: "https://payment.example.com/pay/PL-2024-001",
        expiration_time: "2024-02-15T23:59:59Z",
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        transaction_id: "TXN-2024-001",
        status: "completed",
        amount: 55000,
        timestamp: "2024-01-15T10:30:00Z",
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        transaction_id: "TXN-2024-001",
        status: "completed",
      }),
    };

    const invoice_data = {
      invoice_id,
      customer_id,
      customer_name,
      customer_email,
      invoice_details,
      total_amount,
      invoice_date,
      due_date,
    };

    const validation_result = approveInvoiceWithValidation(
      invoice_data,
      mock_document_storage_adapter,
      mock_notification_service_adapter,
      mock_payment_gateway_adapter
    );

    expect(validation_result).toEqual({
      validation_status: "approved",
      invoice_id,
      total_amount: 55000,
      detail_line_count: 3,
      duplicate_product_detected: true,
      calculation_verified: true,
      errors: [],
    });

    expect(mock_document_storage_adapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        invoice_id,
        customer_name,
      })
    );

    expect(
      mock_notification_service_adapter.sendInvoiceNotification
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        invoice_id,
        customer_email,
      })
    );

    expect(mock_payment_gateway_adapter.generatePaymentLink).toHaveBeenCalledWith(
      expect.objectContaining({
        invoice_id,
        amount: 55000,
      })
    );
  });
});