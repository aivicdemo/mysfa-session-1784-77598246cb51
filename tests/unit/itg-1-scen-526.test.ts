import {
  reconcileDealStatusWithInvoice,
} from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  test("SCEN-526: 商談クローズ日が月末のとき、正常に日付ズレが計算される", () => {
    // Arrange: テスト用の商談レコードを作成
    const dealRecord = {
      dealId: "DEAL-001",
      customerId: "CUST-001",
      status: "negotiation",
      statusUpdatedAt: new Date("2024-01-31T10:00:00Z"),
      amount: 100000,
      closeDate: new Date("2024-01-31"),
      description: "Test deal closing on month-end",
    };

    // スタブ: DocumentStorageAdapter
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: "FILE-001",
        url: "https://storage.example.com/invoice-001.pdf",
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: "https://drive.example.com/share/abc123",
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // スタブ: NotificationServiceAdapter
    const mockNotificationServiceAdapter = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: "MSG-001",
        sentAt: new Date("2024-02-01T09:00:00Z"),
        deliveryStatus: "sent",
      }),
      sendQuoteNotification: jest.fn().mockResolvedValue({}),
      sendOrderNotification: jest.fn().mockResolvedValue({}),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: "delivered",
        openedAt: new Date("2024-02-01T14:30:00Z"),
      }),
    };

    // Act: 商談ステータスを「成約」に更新し、自動照合を実行
    const reconciliationResult = reconcileDealStatusWithInvoice(
      dealRecord,
      {
        invoiceIssuedDate: new Date("2024-02-01T08:30:00Z"),
        invoiceId: "INV-001",
        invoiceAmount: 100000,
      },
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter
    );

    // Assert: 商談ステータス更新日時と請求書発行日の差分を検証
    expect(reconciliationResult).toBeDefined();

    // 期待値: 商談クローズ日（2024-01-31）と請求書発行日（2024-02-01）の差分は1日
    const expectedDateDifferenceDays = 1;
    expect(reconciliationResult.dateDiscrepancyDays).toBe(
      expectedDateDifferenceDays
    );

    // 期待値: ズレが1日以上の場合、不正常フラグが立つ
    expect(reconciliationResult.hasDiscrepancy).toBe(true);

    // 期待値: 不正常フラグの理由
    expect(reconciliationResult.discrepancyReason).toBe("月末越境による発行遅延");

    // 期待値: DocumentStorageAdapterが正常に呼び出されていることを確認
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: expect.stringContaining("invoice"),
        content: expect.any(Buffer),
      })
    );

    // 期待値: NotificationServiceAdapterが正常に呼び出されていることを確認
    expect(
      mockNotificationServiceAdapter.sendInvoiceNotification
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: "CUST-001",
        invoiceId: "INV-001",
      })
    );

    // 期待値: 送信完了ステータスが記録されていること
    expect(reconciliationResult.notificationSentAt).toEqual(
      new Date("2024-02-01T09:00:00Z")
    );

    // 期待値: 照合ステータスが「要対応」と記録されていること
    expect(reconciliationResult.reconciliationStatus).toBe("需要確認");
  });
});