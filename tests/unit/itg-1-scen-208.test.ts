import {
  updateDealStatusToContracted,
  DealRecord,
  CustomerRecord,
  InvoiceRecord,
  DocumentStorageAdapter,
  NotificationServiceAdapter,
  PaymentGatewayAdapter,
} from "../../src/logic/it-1784969823049-2-1-1";

describe("商談レコードの進捗ステータスと提案内容の入力・保存機能", () => {
  // SCEN-208
  test("商談ステータスを成約に変更する際、顧客情報が完全に入力されている場合にステータス更新が成功する", async () => {
    // テスト前提: 商談レコードの設定
    const dealRecord: DealRecord = {
      dealId: "DEAL-001",
      customerId: "CUST-001",
      status: "提案中",
      amount: 150000,
      details: [
        {
          itemId: "ITEM-001",
          itemName: "コンサルティングサービス",
          quantity: 1,
          unitPrice: 150000,
        },
      ],
    };

    // テスト前提: 顧客マスタの完全な入力確認
    const customerRecord: CustomerRecord = {
      customerId: "CUST-001",
      customerName: "株式会社テスト商社",
      postalCode: "100-0001",
      address: "東京都千代田区丸の内1-1-1",
      phoneNumber: "03-1234-5678",
      emailAddress: "contact@test-company.co.jp",
    };

    // モック: DocumentStorageAdapter.uploadDocument
    const mockDocumentStorageAdapter: DocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: "DOC-12345",
        url: "https://storage.example.com/documents/DOC-12345.pdf",
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    // モック: NotificationServiceAdapter.sendInvoiceNotification
    const mockNotificationServiceAdapter: NotificationServiceAdapter = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        status: "SENT",
        messageId: "MSG-001",
      }),
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    // モック: PaymentGatewayAdapter.generatePaymentLink
    const mockPaymentGatewayAdapter: PaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLink: "https://payment.example.com/link-xxx",
        expiresAt: new Date("2024-12-31T23:59:59Z"),
      }),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    // 実行: 商談ステータス更新APIを呼び出し
    const result = await updateDealStatusToContracted(
      dealRecord,
      customerRecord,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    // 検証: 商談レコードのステータスが『成約』に更新されたこと
    expect(result.deal.status).toBe("成約");

    // 検証: 商談に紐付く請求データが新規作成されたこと
    expect(result.invoice).toBeDefined();
    expect(result.invoice.invoiceStatus).toBe("下書き");
    expect(result.invoice.customerId).toBe("CUST-001");
    expect(result.invoice.totalAmount).toBe(150000);

    // 検証: DocumentStorageAdapter.uploadDocumentが1回以上呼び出されたこと
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(1);

    // 検証: NotificationServiceAdapter.sendInvoiceNotificationが1回呼び出され、引数に顧客メールアドレスが含まれていること
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalledTimes(1);
    const notificationCall =
      mockNotificationServiceAdapter.sendInvoiceNotification.mock.calls[0];
    expect(notificationCall[0]).toContain("contact@test-company.co.jp");

    // 検証: PaymentGatewayAdapter.generatePaymentLinkが1回呼び出されたこと
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledTimes(
      1
    );

    // 検証: 返却値に支払いリンク情報が含まれていること
    expect(result.paymentLink).toBe("https://payment.example.com/link-xxx");
  });
});