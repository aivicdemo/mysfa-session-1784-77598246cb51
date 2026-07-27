import {
  linkDealAndInvoice,
} from "../../src/logic/it-1784969823049-1-1-1";

interface MockDocumentStorageAdapter {
  uploadDocument: jest.Mock;
  generateShareLink: jest.Mock;
  deleteDocument: jest.Mock;
}

interface MockNotificationServiceAdapter {
  sendQuoteNotification: jest.Mock;
  sendOrderNotification: jest.Mock;
  sendInvoiceNotification: jest.Mock;
  getDeliveryStatus: jest.Mock;
}

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-272
  test("商談ステータスが『受注』に更新されたとき、対応する請求書が1件存在し、請求金額と商談金額が完全一致する場合、紐付けが正常に成立する", async () => {
    // テストデータの準備
    const customerId = "CUST-001";
    const customerName = "テスト株式会社";
    const dealId = "DEAL-001";
    const dealAmount = 100000;
    const dealStatus = "受注";
    const invoiceId = "INV-001";
    const invoiceAmount = 100000;
    const invoiceDate = new Date("2024-01-15T10:00:00Z");

    // スタブの作成
    const mockDocumentStorageAdapter: MockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: "DOC-001",
        storageUrl: "https://storage.example.com/documents/DOC-001",
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: "https://storage.example.com/share/token123",
        expiresAt: new Date("2024-01-16T10:00:00Z"),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockNotificationServiceAdapter: MockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: "MSG-001",
        status: "sent",
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        messageId: "MSG-002",
        status: "sent",
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: "MSG-003",
        status: "sent",
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        messageId: "MSG-003",
        deliveryStatus: "delivered",
        openedAt: new Date("2024-01-15T11:30:00Z"),
      }),
    };

    // 商談レコード
    const dealRecord = {
      id: dealId,
      customerId: customerId,
      customerName: customerName,
      amount: dealAmount,
      status: dealStatus,
      updatedAt: new Date("2024-01-15T10:00:00Z"),
    };

    // 請求書レコード
    const invoiceRecord = {
      id: invoiceId,
      customerId: customerId,
      customerName: customerName,
      amount: invoiceAmount,
      issueDate: invoiceDate,
      status: "issued",
    };

    // リンク処理の実行
    const linkResult = await linkDealAndInvoice(
      dealRecord,
      invoiceRecord,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter
    );

    // アサーション: リンクが成功したことを確認
    expect(linkResult.isLinked).toBe(true);
    expect(linkResult.dealId).toBe(dealId);
    expect(linkResult.invoiceId).toBe(invoiceId);

    // アサーション: 金額が完全一致することを確認
    expect(linkResult.dealAmount).toBe(100000);
    expect(linkResult.invoiceAmount).toBe(100000);
    expect(linkResult.amountMatches).toBe(true);

    // アサーション: 紐付けステータスが『linked』と記録されていることを確認
    expect(linkResult.linkStatus).toBe("linked");

    // アサーション: 両者の関連性が1対1で明確に結合されていることを確認
    expect(linkResult.linkedPairs).toStrictEqual([
      {
        dealId: dealId,
        invoiceId: invoiceId,
      },
    ]);

    // アサーション: DocumentStorageAdapter.uploadDocumentが1回呼び出されたことを確認
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(1);

    // アサーション: NotificationServiceAdapter.sendInvoiceNotificationが1回呼び出されたことを確認
    expect(
      mockNotificationServiceAdapter.sendInvoiceNotification
    ).toHaveBeenCalledTimes(1);

    // アサーション: sendInvoiceNotificationが正しい引数で呼ばれたことを確認
    expect(
      mockNotificationServiceAdapter.sendInvoiceNotification
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: invoiceId,
        customerId: customerId,
        customerName: customerName,
      })
    );

    // アサーション: uploadDocumentが正しい引数で呼ばれたことを確認
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        documentType: "invoice",
        invoiceId: invoiceId,
      })
    );

    // アサーション: リンク完了時刻が記録されていることを確認
    expect(linkResult.linkedAt).toBeDefined();
    expect(typeof linkResult.linkedAt).toBe("object");
  });
});