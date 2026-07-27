import { generateInvoiceWithNotification } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  test("SCEN-605: NotificationServiceAdapterのsendInvoiceNotificationが失敗した場合、メール送信キューに記録する", async () => {
    // Arrange
    const invoiceId = "INV-2024-001";
    const customerId = "CUST-12345";
    const customerEmail = "customer@example.com";
    const invoiceAmount = 150000;
    const invoiceDate = new Date("2024-01-15T11:00:00Z");
    const invoiceDueDate = new Date("2024-02-15T11:00:00Z");

    const invoiceData = {
      invoiceId,
      customerId,
      customerEmail,
      invoiceAmount,
      invoiceDate,
      invoiceDueDate,
      items: [
        {
          description: "サービス A",
          quantity: 1,
          unitPrice: 100000,
          amount: 100000,
        },
        {
          description: "サービス B",
          quantity: 1,
          unitPrice: 50000,
          amount: 50000,
        },
      ],
    };

    const notificationServiceStub = {
      sendInvoiceNotification: jest
        .fn()
        .mockRejectedValueOnce(new Error("Network connection failed")),
    };

    const emailQueueRepository = {
      findByInvoiceId: jest.fn().mockResolvedValueOnce(null),
      save: jest.fn().mockResolvedValueOnce({}),
    };

    const invoiceRepository = {
      save: jest.fn().mockResolvedValueOnce({
        invoiceId,
        customerId,
        customerEmail,
        invoiceAmount,
        invoiceDate,
        invoiceDueDate,
        status: "発行済み",
      }),
      findById: jest.fn().mockResolvedValueOnce({
        invoiceId,
        customerId,
        customerEmail,
        invoiceAmount,
        status: "発行済み",
      }),
    };

    // Act
    const result = await generateInvoiceWithNotification(
      invoiceData,
      notificationServiceStub,
      emailQueueRepository,
      invoiceRepository
    );

    // Assert
    // (1) メール送信キューに新規レコードが1件記録され、ステータスが「待機中」
    expect(emailQueueRepository.save).toHaveBeenCalledTimes(1);
    const queueRecordCall = emailQueueRepository.save.mock.calls[0][0];
    expect(queueRecordCall.status).toBe("待機中");

    // (2) そのレコードに必須情報が格納されている
    expect(queueRecordCall.invoiceId).toBe(invoiceId);
    expect(queueRecordCall.customerEmail).toBe(customerEmail);
    expect(queueRecordCall.retryCount).toBe(0);
    expect(queueRecordCall.failedAt).toBeDefined();

    // (3) ユーザー画面に表示されるメッセージを確認
    expect(result.userMessage).toBe(
      "メール送信に失敗しました。手動で顧客に連絡してください"
    );

    // (4) 請求書自体はシステムに正常に保存されている
    expect(invoiceRepository.save).toHaveBeenCalledTimes(1);
    expect(result.invoiceStatus).toBe("発行済み");
    expect(result.invoiceId).toBe(invoiceId);
  });
});