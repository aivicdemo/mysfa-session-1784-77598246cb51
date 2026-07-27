import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-735: [normal] 商談ステータス・請求データ照合機能 - 商談ステータスが「受注」で請求書が複数件発行されている場合、照合は成功する
  it("should successfully reconcile deal status and multiple invoices when status is 受注", async () => {
    const { reconcileDealStatusAndInvoiceData } = await import(
      "../../src/logic/it-1784969823049-1-1-1"
    );

    // Arrange: テスト用の商談レコード作成
    const dealId = "DEAL-001";
    const dealStatus = "受注";
    const dealAmount = 1000000;

    // 複数件の請求書レコード作成（3件以上）
    const invoices = [
      {
        invoiceId: "INV-001",
        dealId: dealId,
        issuedDate: new Date("2024-01-10T09:00:00Z"),
        amount: 300000,
      },
      {
        invoiceId: "INV-002",
        dealId: dealId,
        issuedDate: new Date("2024-01-15T10:30:00Z"),
        amount: 400000,
      },
      {
        invoiceId: "INV-003",
        dealId: dealId,
        issuedDate: new Date("2024-01-20T14:00:00Z"),
        amount: 300000,
      },
    ];

    // DocumentStorageAdapterのスタブ化
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        status: 200,
        documentUrl: "https://example.com/doc/INV-001",
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        status: 200,
        shareLink: "https://example.com/share/token-xyz",
      }),
      deleteDocument: jest.fn().mockResolvedValue({ status: 200 }),
    };

    // NotificationServiceAdapterのスタブ化
    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        status: 200,
        messageId: "MSG-001",
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        status: 200,
        messageId: "MSG-002",
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        status: 200,
        messageId: "MSG-003",
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: 200,
        deliveryStatus: "delivered",
      }),
    };

    // 照合対象データの構築
    const reconciliationInput = {
      dealId: dealId,
      dealStatus: dealStatus,
      dealAmount: dealAmount,
      invoices: invoices,
      documentStorageAdapter: mockDocumentStorageAdapter,
      notificationServiceAdapter: mockNotificationServiceAdapter,
    };

    // Act: 商談ステータス・請求データ照合機能を実行
    const reconciliationResult = await reconcileDealStatusAndInvoiceData(
      reconciliationInput
    );

    // Assert: 照合処理の実行結果を検証
    expect(reconciliationResult.isSuccess).toBe(true);
    expect(reconciliationResult.reconciliationStatus).toBe("完了");
    expect(reconciliationResult.dealId).toBe("DEAL-001");
    expect(reconciliationResult.dealStatus).toBe("受注");
    expect(reconciliationResult.invoiceCount).toBe(3);
    expect(reconciliationResult.reconciliationResult).toBe("成功");
    expect(reconciliationResult.hasDiscrepancy).toBe(false);

    // ログの検証
    expect(reconciliationResult.log).toMatch(/商談ID: DEAL-001/);
    expect(reconciliationResult.log).toMatch(/ステータス: 受注/);
    expect(reconciliationResult.log).toMatch(/請求書件数: 3件/);
    expect(reconciliationResult.log).toMatch(/照合結果: 成功/);

    // 不整合フラグが立たないことを確認
    expect(reconciliationResult.discrepancyFlags).toEqual({
      statusMismatch: false,
      invoiceAmountMismatch: false,
      missingInvoice: false,
      overdueInvoice: false,
    });

    // スタブが適切に呼ばれたことを確認
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalled();
  });
});