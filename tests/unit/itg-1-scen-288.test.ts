import {
  linkDealStatusToInvoiceData,
} from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-288
  test("商談ステータスが『受注』に更新された複数商談について、個別の紐付け処理が正常に完了する", () => {
    const testDeals = [
      {
        deal_id: "DEAL-001",
        customer_id: "CUST-A",
        customer_name: "顧客A株式会社",
        customer_email: "contact@customer-a.example.com",
        status: "受注",
        quote_amount: 1000000,
        invoice_address: "東京都渋谷区1-1-1",
        created_at: "2024-01-10T09:00:00Z",
        updated_at: "2024-01-15T14:30:00Z",
      },
      {
        deal_id: "DEAL-002",
        customer_id: "CUST-B",
        customer_name: "顧客B有限会社",
        customer_email: "billing@customer-b.example.com",
        status: "受注",
        quote_amount: 2500000,
        invoice_address: "大阪府北区2-2-2",
        created_at: "2024-01-11T10:00:00Z",
        updated_at: "2024-01-15T14:31:00Z",
      },
      {
        deal_id: "DEAL-003",
        customer_id: "CUST-C",
        customer_name: "顧客C商事",
        customer_email: "finance@customer-c.example.com",
        status: "受注",
        quote_amount: 1800000,
        invoice_address: "名古屋市中区3-3-3",
        created_at: "2024-01-12T11:00:00Z",
        updated_at: "2024-01-15T14:32:00Z",
      },
    ];

    const documentStorageAdapterMock = {
      uploadDocument: jest.fn().mockResolvedValue({
        document_id: "DOC-123",
        storage_path: "invoices/DEAL-001-invoice.pdf",
        uploaded_at: "2024-01-15T14:35:00Z",
      }),
      generateShareLink: jest
        .fn()
        .mockResolvedValue(
          "https://drive.example.com/share/abc123def456"
        ),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const notificationServiceAdapterMock = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        notification_id: "NOTIF-Q-001",
        status: "sent",
        sent_at: "2024-01-15T14:36:00Z",
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        notification_id: "NOTIF-O-001",
        status: "sent",
        sent_at: "2024-01-15T14:36:00Z",
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        notification_id: "NOTIF-I-001",
        status: "sent",
        sent_at: "2024-01-15T14:37:00Z",
        recipient_email: "contact@customer-a.example.com",
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        delivery_status: "delivered",
        opened: true,
        opened_at: "2024-01-15T15:00:00Z",
      }),
    };

    const paymentGatewayAdapterMock = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        payment_link_id: "PL-001",
        payment_url: "https://payment.example.com/pay/token123",
        expires_at: "2024-02-15T14:37:00Z",
        invoice_id: "INV-001",
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        transaction_id: "TRX-001",
        status: "completed",
        paid_amount: 1000000,
        paid_at: "2024-01-16T10:00:00Z",
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        transaction_id: "TRX-001",
        status: "completed",
        amount: 1000000,
      }),
    };

    const result = linkDealStatusToInvoiceData(testDeals, {
      documentStorageAdapter: documentStorageAdapterMock,
      notificationServiceAdapter: notificationServiceAdapterMock,
      paymentGatewayAdapter: paymentGatewayAdapterMock,
    });

    expect(result).toEqual({
      total_deals_processed: 3,
      successful_linkages: 3,
      failed_linkages: 0,
      linkage_details: [
        {
          deal_id: "DEAL-001",
          customer_id: "CUST-A",
          customer_email: "contact@customer-a.example.com",
          linkage_status: "completed",
          invoice_id: "INV-001",
          document_uploaded: true,
          notification_sent: true,
          payment_link_generated: true,
          executed_at: expect.any(String),
          document_storage_call_count: 1,
          notification_service_call_count: 1,
          payment_gateway_call_count: 1,
        },
        {
          deal_id: "DEAL-002",
          customer_id: "CUST-B",
          customer_email: "billing@customer-b.example.com",
          linkage_status: "completed",
          invoice_id: "INV-002",
          document_uploaded: true,
          notification_sent: true,
          payment_link_generated: true,
          executed_at: expect.any(String),
          document_storage_call_count: 1,
          notification_service_call_count: 1,
          payment_gateway_call_count: 1,
        },
        {
          deal_id: "DEAL-003",
          customer_id: "CUST-C",
          customer_email: "finance@customer-c.example.com",
          linkage_status: "completed",
          invoice_id: "INV-003",
          document_uploaded: true,
          notification_sent: true,
          payment_link_generated: true,
          executed_at: expect.any(String),
          document_storage_call_count: 1,
          notification_service_call_count: 1,
          payment_gateway_call_count: 1,
        },
      ],
    });

    expect(documentStorageAdapterMock.uploadDocument).toHaveBeenCalledTimes(3);
    expect(notificationServiceAdapterMock.sendInvoiceNotification).toHaveBeenCalledTimes(
      3
    );
    expect(paymentGatewayAdapterMock.generatePaymentLink).toHaveBeenCalledTimes(
      3
    );

    expect(
      notificationServiceAdapterMock.sendInvoiceNotification
    ).toHaveBeenNthCalledWith(1, expect.objectContaining({
      recipient_email: "contact@customer-a.example.com",
      invoice_id: "INV-001",
    }));

    expect(
      notificationServiceAdapterMock.sendInvoiceNotification
    ).toHaveBeenNthCalledWith(2, expect.objectContaining({
      recipient_email: "billing@customer-b.example.com",
      invoice_id: "INV-002",
    }));

    expect(
      notificationServiceAdapterMock.sendInvoiceNotification
    ).toHaveBeenNthCalledWith(3, expect.objectContaining({
      recipient_email: "finance@customer-c.example.com",
      invoice_id: "INV-003",
    }));

    expect(paymentGatewayAdapterMock.generatePaymentLink).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        invoice_id: "INV-001",
      })
    );

    expect(paymentGatewayAdapterMock.generatePaymentLink).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        invoice_id: "INV-002",
      })
    );

    expect(paymentGatewayAdapterMock.generatePaymentLink).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        invoice_id: "INV-003",
      })
    );
  });
});