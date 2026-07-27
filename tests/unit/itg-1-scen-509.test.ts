import { reconcileDealStatusAndInvoices } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  test("SCEN-509: 商談ステータスが「受注」で請求書が1件のとき、正常に照合処理が完了する", async () => {
    // Arrange: テスト用DBに商談レコードを1件作成
    const dealId = "deal-001";
    const customerId = "cust-001";
    const dealRecord = {
      deal_id: dealId,
      customer_id: customerId,
      amount: 100000,
      status: "受注",
      created_at: "2024-01-15T10:00:00Z",
    };

    // 同じ商談IDに紐付いた請求書レコードを1件作成
    const invoiceId = "invoice-001";
    const invoiceRecord = {
      invoice_id: invoiceId,
      deal_id: dealId,
      customer_id: customerId,
      amount: 100000,
      status: "未払",
      issued_at: "2024-01-15T10:30:00Z",
    };

    // DocumentStorageAdapterのスタブ構成
    const documentStorageStub = {
      uploadDocument: jest.fn().mockResolvedValue({ file_id: "file-123" }),
      generateShareLink: jest.fn().mockResolvedValue({
        share_link: "https://drive.google.com/file/d/123abc",
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // NotificationServiceAdapterのスタブ構成
    const notificationServiceStub = {
      sendQuoteNotification: jest.fn().mockResolvedValue({ status: "sent" }),
      sendOrderNotification: jest.fn().mockResolvedValue({ status: "sent" }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({ status: "sent" }),
      getDeliveryStatus: jest.fn().mockResolvedValue({ delivered: true }),
    };

    // システムログキャプチャ用のスタブ
    const loggerStub = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    // Act: 照合処理を実行
    const reconciliationResult = await reconcileDealStatusAndInvoices(
      {
        deals: [dealRecord],
        invoices: [invoiceRecord],
      },
      {
        documentStorageAdapter: documentStorageStub,
        notificationServiceAdapter: notificationServiceStub,
        logger: loggerStub,
      }
    );

    // Assert: 照合結果の検証
    expect(reconciliationResult).toEqual({
      reconciliation_status: "一致",
      deal_id: "deal-001",
      deal_status: "受注",
      invoice_count: 1,
      discrepancy_detected: false,
      reconciliation_completed_at: expect.stringMatching(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
      ),
      error_message: null,
    });

    // 外部サービス呼び出しが発生していないことを検証
    expect(documentStorageStub.generateShareLink).not.toHaveBeenCalled();
    expect(notificationServiceStub.sendInvoiceNotification).not.toHaveBeenCalled();

    // システムログの検証
    expect(loggerStub.info).toHaveBeenCalledWith(
      "商談deal-001の照合処理が正常に完了しました"
    );
  });
});