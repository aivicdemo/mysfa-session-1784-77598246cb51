import { issueOrderDocument } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータルでの商談情報参照機能", () => {
  // SCEN-070: [edge] 帳票発行時の発行日時自動付与と発行履歴記録 - 注文書の発行日時が月初のとき、その日時が正確に記録される
  test("注文書発行時に月初の日時が秒単位で正確に記録される", async () => {
    const fixed_issue_time = new Date("2024-04-01T09:30:45Z");

    const mock_storage_adapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        document_id: "doc_12345",
        storage_path: "gs://bucket/orders/2024/order_001.pdf",
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const mock_notification_adapter = {
      sendOrderNotification: jest.fn().mockResolvedValue({
        message_id: "msg_67890",
        status: "SENT",
      }),
      sendQuoteNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const mock_audit_log_adapter = {
      logUserAccess: jest.fn().mockResolvedValue(undefined),
      logDataAccess: jest.fn().mockResolvedValue(undefined),
      logPermissionChange: jest.fn().mockResolvedValue(undefined),
      queryAuditLog: jest.fn(),
    };

    const authenticated_user = {
      user_id: "cust_user_001",
      customer_id: "cust_001",
      email: "customer@example.com",
      role: "CUSTOMER_USER",
    };

    const order_input = {
      customer_id: "cust_001",
      order_items: [
        {
          product_id: "prod_001",
          product_name: "Software License",
          quantity: 5,
          unit_price: 10000,
        },
      ],
      total_amount: 50000,
      order_date: fixed_issue_time,
      issued_by_user_id: authenticated_user.user_id,
    };

    const result = await issueOrderDocument(
      order_input,
      mock_storage_adapter,
      mock_notification_adapter,
      mock_audit_log_adapter,
      {
        current_time: fixed_issue_time,
      }
    );

    expect(result.issued_at).toBe("2024-04-01T09:30:45Z");
    expect(result.issued_at_iso).toEqual(fixed_issue_time);
    expect(result.document_type).toBe("ORDER");
    expect(result.status).toBe("SUCCESS");
    expect(result.issue_history_record).toEqual({
      issued_at: "2024-04-01 09:30:45",
      document_type: "ORDER",
      status: "SUCCESS",
      customer_id: "cust_001",
      document_id: "doc_12345",
      storage_path: "gs://bucket/orders/2024/order_001.pdf",
      user_id: authenticated_user.user_id,
    });
    expect(mock_storage_adapter.uploadDocument).toHaveBeenCalledTimes(1);
    expect(mock_notification_adapter.sendOrderNotification).toHaveBeenCalledTimes(
      1
    );
  });
});