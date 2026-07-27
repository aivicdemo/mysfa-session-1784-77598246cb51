import {
  validateMigrationCompletion,
} from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-992: [normal] 移行完了判定機能 - 移行判定結果がすべて合致した場合、是正が不要と判定される
  test("should determine migration as COMPLETE with no corrections required when all data matches between pre and post migration", () => {
    const migration_evaluation_id = "mig-eval-001";
    const evaluated_at = new Date("2024-04-15T10:30:00Z");
    const evaluated_by_user_id = "user-admin-001";

    const pre_migration_customer_data = [
      {
        customer_id: "cust-001",
        customer_name: "ABC Corporation",
        email_address: "contact@abc-corp.com",
        contract_info: {
          contract_id: "cont-001",
          contract_amount: 500000,
          contract_start_date: "2023-01-01",
          contract_end_date: "2024-12-31",
        },
      },
      {
        customer_id: "cust-002",
        customer_name: "XYZ Limited",
        email_address: "info@xyz-ltd.com",
        contract_info: {
          contract_id: "cont-002",
          contract_amount: 750000,
          contract_start_date: "2023-06-01",
          contract_end_date: "2025-05-31",
        },
      },
    ];

    const post_migration_customer_data = [
      {
        customer_id: "cust-001",
        customer_name: "ABC Corporation",
        email_address: "contact@abc-corp.com",
        contract_info: {
          contract_id: "cont-001",
          contract_amount: 500000,
          contract_start_date: "2023-01-01",
          contract_end_date: "2024-12-31",
        },
      },
      {
        customer_id: "cust-002",
        customer_name: "XYZ Limited",
        email_address: "info@xyz-ltd.com",
        contract_info: {
          contract_id: "cont-002",
          contract_amount: 750000,
          contract_start_date: "2023-06-01",
          contract_end_date: "2025-05-31",
        },
      },
    ];

    const salesforce_metadata_data_source = {
      fetchLicenseUsers: jest.fn().mockResolvedValue({
        users: [
          {
            user_id: "sf-user-001",
            username: "user.admin@salesforce.example.com",
            license_type: "Administrator",
            active: true,
          },
          {
            user_id: "sf-user-002",
            username: "user.sales@salesforce.example.com",
            license_type: "Sales Cloud",
            active: true,
          },
        ],
      }),
      fetchEditionDetails: jest.fn().mockResolvedValue({
        editions: [
          {
            edition_name: "Sales Cloud",
            contract_count: 5,
            active_count: 5,
            features: [
              "Lead Management",
              "Opportunity Management",
              "Account Management",
            ],
          },
        ],
      }),
      fetchFeatureUsageMetrics: jest.fn().mockResolvedValue({
        metrics: [
          {
            feature_name: "API Calls",
            usage_percentage: 65,
            limit: 100000,
            remaining: 35000,
          },
        ],
      }),
      fetchAnnualCostData: jest.fn().mockResolvedValue({
        annual_costs: [
          {
            contract_id: "sf-cont-001",
            annual_cost: 200000,
            renewal_date: "2024-12-31",
            discount_percentage: 10,
          },
        ],
      }),
    };

    const document_storage_adapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        document_id: "doc-001",
        storage_url:
          "gs://bucket-example/documents/invoice-20240415-001.pdf",
        uploaded_timestamp: "2024-04-15T10:15:00Z",
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        share_link:
          "https://drive.google.com/file/d/sharelink-token-12345/view",
        expiry_datetime: "2024-04-22T10:15:00Z",
      }),
      deleteDocument: jest.fn().mockResolvedValue({
        deleted: true,
        deletion_timestamp: "2024-04-15T10:16:00Z",
      }),
    };

    const notification_service_adapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        notification_id: "notif-quote-001",
        sent_timestamp: "2024-04-15T10:20:00Z",
        recipient_email: "contact@abc-corp.com",
        status: "delivered",
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        notification_id: "notif-order-001",
        sent_timestamp: "2024-04-15T10:21:00Z",
        recipient_email: "contact@abc-corp.com",
        status: "delivered",
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        notification_id: "notif-invoice-001",
        sent_timestamp: "2024-04-15T10:22:00Z",
        recipient_email: "contact@abc-corp.com",
        status: "delivered",
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        notification_records: [
          {
            notification_id: "notif-quote-001",
            delivered_at: "2024-04-15T10:20:00Z",
            opened_at: "2024-04-15T10:25:00Z",
          },
          {
            notification_id: "notif-order-001",
            delivered_at: "2024-04-15T10:21:00Z",
            opened_at: "2024-04-15T10:26:00Z",
          },
          {
            notification_id: "notif-invoice-001",
            delivered_at: "2024-04-15T10:22:00Z",
            opened_at: "2024-04-15T10:27:00Z",
          },
        ],
      }),
    };

    const payment_gateway_adapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        payment_link_id: "paylink-001",
        url: "https://payment.gmo-pg.com/payment/paylink-token-xyz",
        invoice_id: "inv-001",
        amount: 500000,
        currency: "JPY",
        expiry_datetime: "2024-05-15T10:30:00Z",
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        transaction_id: "txn-001",
        status: "completed",
        paid_amount: 500000,
        paid_timestamp: "2024-04-15T10:30:00Z",
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        transaction_records: [
          {
            transaction_id: "txn-001",
            status: "completed",
            created_at: "2024-04-15T10:30:00Z",
            payment_method: "credit_card",
          },
        ],
      }),
    };

    const license_alert_notification_service = {
      sendLicenseOverageAlert: jest.fn().mockResolvedValue({
        alert_id: "alert-overage-001",
        sent_timestamp: "2024-04-15T10:25:00Z",
        recipient_email: "admin@company.com",
      }),
      sendUnusedUserAlert: jest.fn().mockResolvedValue({
        alert_id: "alert-unused-001",
        sent_timestamp: "2024-04-15T10:26:00Z",
        recipient_email: "admin@company.com",
      }),
      sendCostForecastAlert: jest.fn().mockResolvedValue({
        alert_id: "alert-cost-001",
        sent_timestamp: "2024-04-15T10:27:00Z",
        recipient_email: "admin@company.com",
      }),
    };

    const result = validateMigrationCompletion({
      migration_evaluation_id,
      evaluated_at,
      evaluated_by_user_id,
      pre_migration_customer_data,
      post_migration_customer_data,
      salesforce_metadata_data_source,
      document_storage_adapter,
      notification_service_adapter,
      payment_gateway_adapter,
      license_alert_notification_service,
    });

    expect(result).toEqual({
      migration_evaluation_id: "mig-eval-001",
      migration_status: "COMPLETE",
      correction_required: false,
      evaluation_timestamp: new Date("2024-04-15T10:30:00Z"),
      evaluated_by: "user-admin-001",
      validation_results: {
        customer_data_match: true,
        customer_data_match_count: 2,
        license_and_user_data_match: true,
        license_user_match_count: 2,
        document_storage_history_match: true,
        document_history_match_count: 3,
        notification_log_match: true,
        notification_log_match_count: 3,
        payment_transaction_history_match: true,
        payment_transaction_match_count: 1,
      },
      completion_remarks:
        "All migration validation checks passed. No corrections required. System is ready for full operational use.",
    });
  });
});