import { issueOrder } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向け専用ポータルでの商談情報参照機能", () => {
  // SCEN-067
  test("[edge] 帳票発行時の発行日時自動付与と発行履歴記録 - 注文書の発行日時が月末のとき、その日時が正確に記録される", () => {
    const system_date_time_at_month_end = new Date("2024-01-31T23:59:59Z");
    const authenticated_customer_user_id = "CUST_USER_001";
    const order_id = "ORD_2024_001";
    const document_pdf_content = Buffer.from("mock_pdf_content");

    const mock_document_storage_adapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        success: true,
        document_id: "DOC_UPLOADED_001",
        cloud_storage_url: "https://storage.example.com/documents/DOC_UPLOADED_001",
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        share_link: "https://share.example.com/DOC_UPLOADED_001",
        expiration_timestamp: new Date("2024-02-07T23:59:59Z").toISOString(),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const mock_notification_service_adapter = {
      sendOrderNotification: jest.fn().mockResolvedValue({
        message_id: "MSG_ORDER_001",
        delivery_status: "sent",
        timestamp: system_date_time_at_month_end.toISOString(),
      }),
      sendQuoteNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const mock_order_data = {
      order_id: order_id,
      customer_id: "CUST_001",
      customer_email: "customer@example.com",
      order_amount: 150000,
      order_items: [
        {
          item_id: "ITEM_001",
          product_name: "Product A",
          quantity: 2,
          unit_price: 50000,
          line_total: 100000,
        },
        {
          item_id: "ITEM_002",
          product_name: "Product B",
          quantity: 1,
          unit_price: 50000,
          line_total: 50000,
        },
      ],
      order_status: "draft",
      created_timestamp: new Date("2024-01-31T10:00:00Z").toISOString(),
    };

    const mock_issue_history_record = {
      history_id: "HIST_ORD_2024_001",
      order_id: order_id,
      issue_datetime: "2024-01-31T23:59:59Z",
      issue_datetime_seconds_precision: 1706745599,
      timezone_offset_utc: "+00:00",
      issued_by_user_id: authenticated_customer_user_id,
      document_type: "order",
      document_storage_id: "DOC_UPLOADED_001",
      notification_status: "sent",
      notification_message_id: "MSG_ORDER_001",
    };

    const result = issueOrder(
      order_id,
      authenticated_customer_user_id,
      mock_order_data,
      system_date_time_at_month_end,
      mock_document_storage_adapter,
      mock_notification_service_adapter
    );

    expect(result.success).toBe(true);
    expect(result.issued_order_id).toBe(order_id);
    expect(result.document_id).toBe("DOC_UPLOADED_001");

    expect(result.issue_history_record.issue_datetime).toBe(
      "2024-01-31T23:59:59Z"
    );
    expect(result.issue_history_record.issue_datetime_seconds_precision).toBe(
      1706745599
    );
    expect(result.issue_history_record.timezone_offset_utc).toBe("+00:00");

    expect(mock_document_storage_adapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        document_type: "order",
        order_id: order_id,
        pdf_content: expect.any(Buffer),
      })
    );

    expect(
      mock_notification_service_adapter.sendOrderNotification
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        order_id: order_id,
        customer_email: "customer@example.com",
        notification_sent_timestamp: "2024-01-31T23:59:59Z",
      })
    );

    expect(result.issue_history_record.issue_datetime).toBe(
      mock_issue_history_record.issue_datetime
    );
    expect(result.issue_history_record.timezone_offset_utc).toBe(
      mock_issue_history_record.timezone_offset_utc
    );
  });
});