import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import { sendOrderNotificationWithErrorHandling } from "../../src/logic/it-1784969823049-2-1-2";

interface NotificationServiceAdapterStub {
  sendOrderNotification: jest.Mock;
}

interface OrderData {
  orderId: string;
  customerId: string;
  customerEmail: string;
  amount: number;
  productInfo: string;
}

interface ErrorHandlingResult {
  success: boolean;
  userMessage: string;
  systemLogEntry: {
    timestamp: string;
    orderId: string;
    errorType: string;
    resendQueueRegistered: boolean;
  };
}

describe("顧客向けポータル - 注文確定時のメール送信エラーハンドリング", () => {
  // SCEN-161
  test("Google Workspace メール API連携 - sendOrderNotificationが失敗した場合、利用者に「メール送信に失敗しました。手動で顧客に連絡してください」メッセージが表示される", async () => {
    // Setup: テスト用の顧客メールアドレスと注文データを準備
    const orderData: OrderData = {
      orderId: "ORD-2024-001",
      customerId: "CUST-123",
      customerEmail: "customer@example.com",
      amount: 50000,
      productInfo: "サーバーライセンス 1年間",
    };

    const systemTimestamp = "2024-01-15T14:30:00Z";

    // Setup: NotificationServiceAdapterのsendOrderNotificationメソッドをスタブ化
    // エラーレスポンス（TimeoutError）を返すように設定
    const notificationAdapterStub: NotificationServiceAdapterStub = {
      sendOrderNotification: jest.fn().mockRejectedValueOnce(
        new Error("Request timeout after 30000ms")
      ),
    };

    // Execute: 注文確定フローを実行し、sendOrderNotificationの呼び出しをトリガー
    const result: ErrorHandlingResult =
      await sendOrderNotificationWithErrorHandling(orderData, notificationAdapterStub, systemTimestamp);

    // Assert: エラーハンドリングロジックが実行され、利用者向けメッセージが生成される
    expect(result.success).toBe(false);
    expect(result.userMessage).toBe(
      "メール送信に失敗しました。手動で顧客に連絡してください"
    );

    // Assert: sendOrderNotificationの呼び出しが確認できる
    expect(notificationAdapterStub.sendOrderNotification).toHaveBeenCalledTimes(
      1
    );
    expect(notificationAdapterStub.sendOrderNotification).toHaveBeenCalledWith({
      orderId: orderData.orderId,
      customerEmail: orderData.customerEmail,
      amount: orderData.amount,
      productInfo: orderData.productInfo,
    });

    // Assert: 画面に表示されるメッセージの内容を確認
    expect(result.userMessage).toMatch(/メール送信に失敗/);
    expect(result.userMessage).toMatch(/手動で顧客に連絡/);

    // Assert: sendOrderNotificationの失敗がシステムログに記録される
    expect(result.systemLogEntry).toBeDefined();
    expect(result.systemLogEntry.orderId).toBe("ORD-2024-001");
    expect(result.systemLogEntry.errorType).toBe("TimeoutError");
    expect(result.systemLogEntry.timestamp).toBe(systemTimestamp);

    // Assert: 管理画面から再送信キューへの登録が確認できる
    expect(result.systemLogEntry.resendQueueRegistered).toBe(true);
  });
});