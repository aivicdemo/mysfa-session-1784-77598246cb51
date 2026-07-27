import {
  reconcileDealStatusAndInvoicing,
} from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  test("SCEN-505: 商談ステータスが「受注」で請求書金額が商談金額と完全に一致するとき、金額ズレがないと判定される", async () => {
    // Arrange: テストデータ準備
    const dealRecord = {
      deal_id: "DL-001",
      status: "受注",
      amount: 150000,
      customer_id: "CUST-001",
      customer_name: "テスト顧客",
      created_at: new Date("2024-01-15T10:00:00Z"),
    };

    const invoiceRecord = {
      invoice_id: "INV-001",
      deal_id: "DL-001",
      amount: 150000,
      issued_at: new Date("2024-01-15T11:00:00Z"),
      customer_id: "CUST-001",
    };

    // DocumentStorageAdapter スタブ
    const documentStorageAdapterStub = {
      uploadDocument: jest.fn().mockResolvedValue({
        document_id: "DOC-001",
        storage_path: "/invoices/INV-001.pdf",
        created_at: new Date("2024-01-15T11:05:00Z"),
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        share_link: "https://drive.google.com/file/d/xxxxx",
        expiry: new Date("2024-01-22T11:05:00Z"),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // NotificationServiceAdapter スタブ
    const notificationServiceAdapterStub = {
      sendQuoteNotification: jest
        .fn()
        .mockResolvedValue({ notification_id: "NOTIF-001", status: "sent" }),
      sendOrderNotification: jest
        .fn()
        .mockResolvedValue({ notification_id: "NOTIF-002", status: "sent" }),
      sendInvoiceNotification: jest
        .fn()
        .mockResolvedValue({ notification_id: "NOTIF-003", status: "sent" }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        delivery_status: "delivered",
        opened_at: new Date("2024-01-15T12:00:00Z"),
      }),
    };

    // PaymentGatewayAdapter スタブ
    const paymentGatewayAdapterStub = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        payment_link_id: "PL-001",
        payment_url: "https://payment.gmo.jp/xxxxx",
        amount: 150000,
        created_at: new Date("2024-01-15T11:05:00Z"),
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        transaction_id: "TXN-001",
        status: "success",
        amount: 150000,
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        transaction_id: "TXN-001",
        status: "completed",
        amount: 150000,
      }),
    };

    // Act: 商談ステータスと請求書発行状況の自動照合を実行
    const reconciliationResult = await reconcileDealStatusAndInvoicing(
      dealRecord,
      invoiceRecord,
      documentStorageAdapterStub,
      notificationServiceAdapterStub,
      paymentGatewayAdapterStub
    );

    // Assert: 照合結果の検証
    expect(reconciliationResult.has_discrepancy).toBe(false);
    expect(reconciliationResult.discrepancy_amount).toBe(0);
    expect(reconciliationResult.match_status).toBe("一致");
    expect(reconciliationResult.alert_generated).toBe(false);

    // 照合履歴レコードの検証
    expect(reconciliationResult.reconciliation_record).toEqual({
      reconciliation_id: expect.any(String),
      deal_id: "DL-001",
      invoice_id: "INV-001",
      reconciliation_date: expect.any(Date),
      deal_amount: 150000,
      invoice_amount: 150000,
      discrepancy_amount: 0,
      judgment_result: "一致",
      deal_status: "受注",
      has_discrepancy: false,
    });

    // 外部サービスが呼び出されたことを確認（正常系では想定通り）
    expect(documentStorageAdapterStub.uploadDocument).toHaveBeenCalled();
    expect(notificationServiceAdapterStub.sendInvoiceNotification).toHaveBeenCalled();
    expect(paymentGatewayAdapterStub.generatePaymentLink).toHaveBeenCalled();
  });
});