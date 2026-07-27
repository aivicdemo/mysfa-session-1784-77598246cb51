import { describe, test, expect, beforeEach } from "@jest/globals";
import type { NotificationServiceAdapter } from "../../src/adapters/NotificationServiceAdapter";
import { issueQuoteWithNotification } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル - 見積書発行時のメール送信", () => {
  // SCEN-156
  test("Google Workspace メール API連携 - sendQuoteNotificationが成功応答を返した場合、見積書発行時に顧客メールアドレスへメールが送信される", async () => {
    // 準備: テスト用の顧客データ
    const customerData = {
      customerId: "CUST-001",
      customerEmail: "customer@example.com",
      customerName: "テスト顧客",
    };

    // 準備: テスト用の見積書データ
    const quoteData = {
      quoteId: "QUOTE-2024-001",
      amount: 150000,
      validUntil: "2024-12-31T23:59:59Z",
      createdAt: "2024-11-15T10:00:00Z",
    };

    // 準備: NotificationServiceAdapterのモック実装
    const mockNotificationAdapter: NotificationServiceAdapter = {
      sendQuoteNotification: jest.fn(async (email, quoteInfo) => {
        return {
          success: true,
          messageId: "msg-12345",
        };
      }),
      sendOrderNotification: jest.fn(async () => ({})),
      sendInvoiceNotification: jest.fn(async () => ({})),
      getDeliveryStatus: jest.fn(async () => ({})),
    };

    // 実行: 見積書発行処理を実行
    const result = await issueQuoteWithNotification(
      customerData,
      quoteData,
      mockNotificationAdapter
    );

    // 検証: sendQuoteNotificationメソッドが呼び出されたことを確認
    expect(mockNotificationAdapter.sendQuoteNotification).toHaveBeenCalled();

    // 検証: sendQuoteNotificationメソッドの呼び出し回数が1回であることを確認
    expect(
      mockNotificationAdapter.sendQuoteNotification
    ).toHaveBeenCalledTimes(1);

    // 検証: sendQuoteNotificationメソッドに渡された引数を確認
    const callArgs = (
      mockNotificationAdapter.sendQuoteNotification as jest.Mock
    ).mock.calls[0];
    expect(callArgs[0]).toBe("customer@example.com");
    expect(callArgs[1]).toEqual(
      expect.objectContaining({
        quoteId: "QUOTE-2024-001",
        amount: 150000,
      })
    );

    // 検証: 見積書発行処理の戻り値が、メール送信成功を示す状態になっていることを確認
    expect(result).toEqual({
      quoteId: "QUOTE-2024-001",
      status: "発行済み",
      notificationStatus: "送信成功",
      messageId: "msg-12345",
      issuedAt: "2024-11-15T10:00:00Z",
    });
  });
});