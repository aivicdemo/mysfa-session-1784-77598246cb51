import { issueQuoteWithTimestamp } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向け専用ポータルでの商談情報参照機能", () => {
  // SCEN-060
  test("[normal] 帳票発行時の発行日時自動付与と発行履歴記録 - 見積書の発行日時が過去の日時のとき、その日時が記録される", async () => {
    const pastIssueDateTime = new Date("2024-01-10T09:30:00Z");
    const currentDateTime = new Date("2024-01-15T12:00:00Z");

    const quoteData = {
      customerId: "CUST-001",
      customerName: "テスト顧客",
      productName: "商品A",
      quantity: 10,
      unitPrice: 5000,
      totalAmount: 50000,
      issueDateTime: pastIssueDateTime,
    };

    const documentStorageAdapterStub = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: "doc-123",
        url: "https://drive.example.com/file/doc-123",
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: "https://drive.example.com/share/doc-123",
      }),
      deleteDocument: jest.fn().mockResolvedValue(true),
    };

    const notificationServiceAdapterStub = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: "msg-123",
        deliveryStatus: "sent",
      }),
      sendOrderNotification: jest.fn().mockResolvedValue(null),
      sendInvoiceNotification: jest.fn().mockResolvedValue(null),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: "delivered",
      }),
    };

    const result = await issueQuoteWithTimestamp(
      quoteData,
      documentStorageAdapterStub,
      notificationServiceAdapterStub
    );

    expect(result.issuanceHistory).toBeDefined();
    expect(result.issuanceHistory.quoteId).toBeDefined();
    expect(result.issuanceHistory.issueDateTime).toEqual(pastIssueDateTime);
    expect(result.issuanceHistory.issueDateTime.getTime()).toBe(
      pastIssueDateTime.getTime()
    );
    expect(result.issuanceHistory.customerId).toBe("CUST-001");
    expect(result.issuanceHistory.totalAmount).toBe(50000);
    expect(result.issuanceHistory.status).toBe("issued");

    expect(documentStorageAdapterStub.uploadDocument).toHaveBeenCalledTimes(1);
    expect(notificationServiceAdapterStub.sendQuoteNotification).toHaveBeenCalledTimes(
      1
    );

    const uploadCallArgs = documentStorageAdapterStub.uploadDocument.mock
      .calls[0][0];
    expect(uploadCallArgs.issueDateTime).toEqual(pastIssueDateTime);

    const notificationCallArgs = notificationServiceAdapterStub
      .sendQuoteNotification.mock.calls[0][0];
    expect(notificationCallArgs.issueDateTime).toEqual(pastIssueDateTime);
  });
});