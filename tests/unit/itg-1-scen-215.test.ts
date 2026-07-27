import { updateDealStatusToContracted } from "../../src/logic/it-1784969823049-2-1-1";

describe("商談レコードの進捗ステータスと提案内容の入力・保存機能", () => {
  // SCEN-215
  test("商談ステータスを成約に変更する際、必須項目チェックで明細データが複数件の場合にステータス更新が成功する", async () => {
    // Test data preparation: 商談レコード（ステータス：交渉中、顧客ID：CUST-001）を作成する
    const dealRecord = {
      dealId: "DEAL-001",
      customerId: "CUST-001",
      customerName: "テスト株式会社",
      dealName: "テスト案件",
      expectedRevenue: 15000,
      dealDeadline: new Date("2024-12-31T23:59:59Z"),
      status: "交渉中",
      updatedAt: new Date("2024-01-15T10:00:00Z"),
    };

    // Test data preparation: 上記商談に紐付く請求明細データを2件作成する
    const invoiceLineItems = [
      {
        lineItemId: "LINE-001",
        productName: "商品A",
        quantity: 10,
        unitPrice: 1000,
        lineTotal: 10000,
      },
      {
        lineItemId: "LINE-002",
        productName: "商品B",
        quantity: 5,
        unitPrice: 2000,
        lineTotal: 10000,
      },
    ];

    // DocumentStorageAdapter.uploadDocument をモック化
    const mockDocumentStorage = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: "DOC-001",
        shareLink: "https://drive.example.com/share/DOC-001",
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    // NotificationServiceAdapter.sendInvoiceNotification をモック化
    const mockNotificationService = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        notificationId: "NOTIF-001",
        deliveryStatus: "成功",
      }),
      getDeliveryStatus: jest.fn(),
    };

    // テスト実行：ステータスを「成約」に更新
    const result = await updateDealStatusToContracted(
      {
        dealId: dealRecord.dealId,
        customerId: dealRecord.customerId,
        customerName: dealRecord.customerName,
        customerEmail: "customer@example.com",
        dealName: dealRecord.dealName,
        expectedRevenue: dealRecord.expectedRevenue,
        dealDeadline: dealRecord.dealDeadline,
        currentStatus: dealRecord.status,
        invoiceLineItems: invoiceLineItems,
      },
      mockDocumentStorage,
      mockNotificationService
    );

    // 期待結果：商談ステータスが「成約」に更新される
    expect(result.dealStatus).toBe("成約");

    // 期待結果：請求書が生成され、DocumentStorageAdapter.uploadDocument が1回呼び出される
    expect(mockDocumentStorage.uploadDocument).toHaveBeenCalledTimes(1);
    expect(mockDocumentStorage.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceLineItems: invoiceLineItems,
        totalAmount: 20000,
      })
    );

    // 期待結果：NotificationServiceAdapter.sendInvoiceNotification が1回呼び出される
    expect(mockNotificationService.sendInvoiceNotification).toHaveBeenCalledTimes(
      1
    );
    expect(mockNotificationService.sendInvoiceNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        customerEmail: "customer@example.com",
        dealId: dealRecord.dealId,
      })
    );

    // 期待結果：ステータス更新完了メッセージが返される
    expect(result.message).toMatch(/成約に変更/);

    // 期待結果：商談の更新日時が現在時刻に更新される（更新前より後の時刻であることを確認）
    const originalUpdatedAt = new Date("2024-01-15T10:00:00Z");
    expect(new Date(result.updatedAt).getTime()).toBeGreaterThan(
      originalUpdatedAt.getTime()
    );

    // 期待結果：請求明細2件のデータはそのまま保持される
    expect(result.invoiceLineItems).toEqual(invoiceLineItems);
    expect(result.invoiceLineItems).toHaveLength(2);
    expect(result.invoiceLineItems[0].productName).toBe("商品A");
    expect(result.invoiceLineItems[1].productName).toBe("商品B");

    // 期待結果：ドキュメントID、共有リンクが返される
    expect(result.documentId).toBe("DOC-001");
    expect(result.shareLink).toBe("https://drive.example.com/share/DOC-001");

    // 期待結果：通知配信ステータスが成功であることを確認
    expect(result.notificationStatus).toBe("成功");
  });
});