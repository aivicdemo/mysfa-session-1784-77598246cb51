import { getDeliveryStatus } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  test("SCEN-1005: Google Workspace メール API連携 - getDeliveryStatusが成功応答を受けた場合、メール配信ステータスと開封ログが取得される", async () => {
    // モック化されたNotificationServiceAdapterの成功応答を定義
    const mockDeliveryStatus = {
      mailId: "mail-001",
      deliveryStatus: "delivered",
      deliveryTimestamp: "2024-01-15T10:30:00Z",
      openStatus: "opened",
      openTimestamp: "2024-01-15T11:15:00Z",
      recipientEmail: "customer@example.com",
    };

    // NotificationServiceAdapterをモック化
    const mockNotificationServiceAdapter = {
      getDeliveryStatus: jest.fn().mockResolvedValue(mockDeliveryStatus),
    };

    // getDeliveryStatusを呼び出す
    const result = await getDeliveryStatus(mockNotificationServiceAdapter);

    // 戻り値としてメール配信ステータスオブジェクトが返却されることを確認
    expect(result).toBeDefined();

    // 戻り値に配信ステータス情報が含まれていることを確認
    expect(result.deliveryStatus).toBe("delivered");
    expect(result.deliveryTimestamp).toBe("2024-01-15T10:30:00Z");

    // 戻り値に開封ログ情報が含まれていることを確認
    expect(result.openStatus).toBe("opened");
    expect(result.openTimestamp).toBe("2024-01-15T11:15:00Z");

    // 受信者のメールアドレスが含まれていることを確認
    expect(result.recipientEmail).toBe("customer@example.com");

    // メールIDが返却されることを確認
    expect(result.mailId).toBe("mail-001");

    // モック関数が呼び出されたことを確認
    expect(mockNotificationServiceAdapter.getDeliveryStatus).toHaveBeenCalled();
  });
});