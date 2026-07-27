import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  it("SCEN-629: 商談ステータスが『失注』のとき、請求書との照合対象外として除外される", async () => {
    // ===== Setup: モック・スタブの準備 =====
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn(),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    // ===== テスト用データ準備 =====
    const deal_data = {
      deal_id: "DEAL-001",
      customer_name: "テスト顧客A",
      amount_jpy: 1000000,
      status: "失注",
      created_at: new Date("2024-01-15T10:00:00Z"),
    };

    const invoice_data = {
      invoice_id: "INV-001",
      customer_name: "テスト顧客A",
      amount_jpy: 1000000,
      issue_date: new Date("2024-01-15T11:00:00Z"),
      payment_status: "未払い",
    };

    // ===== Import & 関数実行 =====
    const {
      reconcileDealAndInvoiceStatus,
    } = await import(
      "../../src/logic/it-1784969823049-1-1-1"
    );

    const reconciliation_result = await reconcileDealAndInvoiceStatus(
      [deal_data],
      [invoice_data],
      {
        documentStorageAdapter: mockDocumentStorageAdapter,
        notificationServiceAdapter: mockNotificationServiceAdapter,
        paymentGatewayAdapter: mockPaymentGatewayAdapter,
      }
    );

    // ===== Assertion: 期待結果の検証 =====

    // 1. 商談『DEAL-001』（ステータス『失注』）が照合対象外として明示的に除外されること
    expect(reconciliation_result.excluded_deals).toContainEqual(
      expect.objectContaining({
        deal_id: "DEAL-001",
        exclusion_reason: "失注ステータスのため除外",
      })
    );

    // 2. 請求書『INV-001』が照合対象から排除されること
    expect(reconciliation_result.excluded_invoices).toContainEqual(
      expect.objectContaining({
        invoice_id: "INV-001",
        exclusion_reason: "商談失注に紐づく請求書のため照合対象外",
      })
    );

    // 3. 照合結果ログに『DEAL-001は失注ステータスのため除外』という判定理由が記載されること
    expect(reconciliation_result.reconciliation_log).toContain(
      expect.stringContaining("DEAL-001は失注ステータスのため除外")
    );

    // 4. 除外対象の商談・請求書組み合わせ数が『1件』と正確にカウントされること
    expect(reconciliation_result.excluded_count).toBe(1);

    // 5. 照合対象外として処理されたため、実際の照合処理は実行されていないこと
    expect(reconciliation_result.reconciled_deals).toHaveLength(0);
    expect(reconciliation_result.reconciled_invoices).toHaveLength(0);

    // 6. 外部サービスアダプタが不必要に呼び出されていないことを確認
    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(
      mockNotificationServiceAdapter.sendInvoiceNotification
    ).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).not.toHaveBeenCalled();
  });
});