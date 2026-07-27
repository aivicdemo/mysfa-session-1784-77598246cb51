import {
  reconcileInvoiceStatusWithDeal,
} from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-293: [edge] 商談ステータスと請求データの紐付け・可視化 - 請求書の発行日が月初のとき、期日ズレの判定が正常に実行される
  test("請求書の発行日が月初（2024年1月1日）、期日が2024年2月29日の場合、期日ズレ判定フラグがfalseになり、請求書ステータスが発行済み、商談ステータスが請求済みに更新されること", () => {
    // テストデータの準備
    const invoiceId = "INV-2024-001";
    const dealId = "DEAL-2024-001";
    const customerId = "CUST-001";
    const invoiceAmount = 100000;
    const invoiceIssuedDate = new Date("2024-01-01T00:00:00Z");
    const invoiceDueDate = new Date("2024-02-29T00:00:00Z");

    const mockDeal = {
      deal_id: dealId,
      customer_id: customerId,
      status: "contract_completed",
      amount: invoiceAmount,
      created_at: new Date("2023-12-15T10:00:00Z"),
    };

    const mockInvoice = {
      invoice_id: invoiceId,
      deal_id: dealId,
      customer_id: customerId,
      amount: invoiceAmount,
      issued_date: invoiceIssuedDate,
      due_date: invoiceDueDate,
      status: "pending",
      delay_flag: undefined,
    };

    // DocumentStorageAdapterのスタブ化
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        document_url: "https://storage.example.com/invoice-2024-001.pdf",
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        share_link: "https://share.example.com/token123",
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // NotificationServiceAdapterのスタブ化
    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        notification_id: "NOTIF-001",
        status: "sent",
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        notification_id: "NOTIF-002",
        status: "sent",
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        notification_id: "NOTIF-003",
        status: "sent",
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        delivered: true,
        opened: false,
      }),
    };

    // PaymentGatewayAdapterのスタブ化
    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        payment_link: "https://payment.example.com/pay123",
        link_expiry: new Date("2024-02-29T23:59:59Z"),
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        transaction_id: "TXN-001",
        status: "pending",
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        transaction_id: "TXN-001",
        status: "pending",
        amount: invoiceAmount,
      }),
    };

    // 対象関数を実行
    const result = reconcileInvoiceStatusWithDeal(
      mockInvoice,
      mockDeal,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    // 期日ズレ判定フラグがfalseであることを検証（月初発行かつ通常期日設定のため、ズレなし）
    expect(result.delay_flag).toBe(false);

    // 請求書ステータスが「発行済み」に遷移していることを検証
    expect(result.invoice_status).toBe("issued");

    // 商談ステータスが「請求済み」に紐付け更新されていることを検証
    expect(result.deal_status).toBe("invoiced");

    // 両レコードの紐付けが正常に確立されていることを検証
    expect(result.invoice_id).toBe(invoiceId);
    expect(result.deal_id).toBe(dealId);
    expect(result.customer_id).toBe(customerId);
    expect(result.amount).toBe(invoiceAmount);

    // 外部サービスへの呼び出しが発生することを検証
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalled();

    // 実際の外部API通信が行われないことを検証（スタブが使用されていることで確認）
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        invoice_id: invoiceId,
      })
    );
  });
});