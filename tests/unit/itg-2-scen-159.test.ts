import { getDeliveryStatus } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向け専用ポータルでの商談情報参照機能', () => {
  // SCEN-159
  test('[normal] Google Workspace メール API連携 - getDeliveryStatusが成功応答を返した場合、メール配信ステータスと開封ログが正確に取得される', async () => {
    // Setup: NotificationServiceAdapterのgetDeliveryStatusメソッドをモック化
    const mockDeliveryId = 'mail-delivery-20240115-001';
    const mockRecipientEmail = 'customer@example.com';
    const deliveredAt = new Date('2024-01-15T10:00:00Z');
    const openedAt = new Date('2024-01-15T11:30:00Z');

    const mockNotificationServiceAdapter = {
      getDeliveryStatus: jest.fn().mockResolvedValue({
        deliveryId: mockDeliveryId,
        deliveryStatus: 'delivered',
        deliveredAt: deliveredAt.toISOString(),
        openStatus: 'opened',
        openedAt: openedAt.toISOString(),
        recipientEmail: mockRecipientEmail,
      }),
    };

    // Act: getDeliveryStatusを呼び出し、特定のメール配信IDに対する配信ステータスと開封ログを取得
    const result = await getDeliveryStatus(mockDeliveryId, mockNotificationServiceAdapter);

    // Assert: 配信ステータスが'delivered'であることを確認
    expect(result.deliveryStatus).toBe('delivered');

    // Assert: 開封ステータスが'opened'であることを確認
    expect(result.openStatus).toBe('opened');

    // Assert: 開封日時が配信日時より後の日時であることを確認
    expect(new Date(result.openedAt).getTime()).toBeGreaterThan(new Date(result.deliveredAt).getTime());

    // Assert: 受信者メールアドレスが期待値と一致することを確認
    expect(result.recipientEmail).toBe(mockRecipientEmail);

    // Assert: メール配信IDが期待値と一致することを確認
    expect(result.deliveryId).toBe(mockDeliveryId);
  });
});