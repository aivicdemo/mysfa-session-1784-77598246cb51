import {
  reconcileDealAndInvoiceStatus,
  type DealRecord,
  type InvoiceRecord,
  type ReconciliationResult,
} from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-528
  test("[normal] 商談クローズ日と請求書発行日が同一月にあるとき、正常に日付ズレが計算される", () => {
    // テストデータ: 商談レコード
    const dealRecord: DealRecord = {
      dealId: "DEAL-001",
      dealName: "テスト商談",
      closeDate: new Date("2024-01-15T00:00:00Z"),
      status: "クローズ",
      amount: 100000,
    };

    // テストデータ: 請求書レコード
    const invoiceRecord: InvoiceRecord = {
      invoiceId: "INV-001",
      issueDate: new Date("2024-01-20T00:00:00Z"),
      amount: 100000,
      status: "発行済み",
      dealId: "DEAL-001",
    };

    // DocumentStorageAdapterのモック
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: "DOC-001",
        url: "https://storage.example.com/DOC-001",
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink:
          "https://storage.example.com/share/abc123?expiry=2024-02-15",
        expiryDate: new Date("2024-02-15T00:00:00Z"),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // NotificationServiceAdapterのモック
    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({ messageId: "msg-1" }),
      sendOrderNotification: jest.fn().mockResolvedValue({ messageId: "msg-2" }),
      sendInvoiceNotification: jest
        .fn()
        .mockResolvedValue({ messageId: "msg-3" }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: "delivered",
        openedAt: new Date("2024-01-20T12:30:00Z"),
      }),
    };

    // PaymentGatewayAdapterのモック
    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLink: "https://payment.example.com/link/xyz789",
        expiryDate: new Date("2024-02-20T00:00:00Z"),
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        transactionId: "TXN-001",
        status: "completed",
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        transactionId: "TXN-001",
        status: "completed",
      }),
    };

    // 日付ズレ計算機能を実行
    const result: ReconciliationResult = reconcileDealAndInvoiceStatus(
      dealRecord,
      invoiceRecord,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    // 期待結果の検証
    // 日付ズレ日数が5日と計算される
    expect(result.daysDifference).toBe(5);

    // ズレの方向が「請求書発行が商談クローズより後」と判定される
    expect(result.discrepancyDirection).toBe("請求書発行が商談クローズより後");

    // 商談ステータス「クローズ」と請求書ステータス「発行済み」は正常な状態
    expect(result.isNormalStatus).toBe(true);

    // ズレ検出フラグは立たない（異常なし）
    expect(result.hasDiscrepancy).toBe(false);

    // 同一月内（2024-01-15と2024-01-20）であることを確認
    expect(result.isWithinSameMonth).toBe(true);
  });
});