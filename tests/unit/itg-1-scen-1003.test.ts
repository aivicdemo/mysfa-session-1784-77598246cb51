import { confirmOrder } from '../../src/logic/it-1-1';

interface NotificationServiceAdapterMock {
  sendOrderNotification: jest.Mock;
}

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-1003
  test('Google Workspace メール API連携 - sendOrderNotificationが成功応答を受けた場合、顧客へ注文確定通知が送信される', async () => {
    const orderId = 'ORD-2024-0001';
    const customerEmail = 'customer@example.com';
    const customerName = 'Test Company Inc.';
    const orderAmount = 150000;
    const orderDate = '2024-01-15';
    const orderItems = [
      {
        productId: 'PROD-001',
        productName: 'Software License',
        quantity: 2,
        unitPrice: 50000,
        totalPrice: 100000,
      },
      {
        productId: 'PROD-002',
        productName: 'Support Service',
        quantity: 1,
        unitPrice: 50000,
        totalPrice: 50000,
      },
    ];

    const assumedSuccessResponse = {
      messageId: 'msg-20240115-001',
      deliveryStatus: 'sent',
      sentAt: '2024-01-15T10:30:00Z',
    };

    const notificationServiceAdapterMock: NotificationServiceAdapterMock = {
      sendOrderNotification: jest.fn().mockResolvedValue(assumedSuccessResponse),
    };

    const result = await confirmOrder(
      {
        orderId,
        customerEmail,
        customerName,
        orderAmount,
        orderDate,
        orderItems,
      },
      notificationServiceAdapterMock
    );

    expect(notificationServiceAdapterMock.sendOrderNotification).toHaveBeenCalledTimes(1);
    expect(notificationServiceAdapterMock.sendOrderNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientEmail: customerEmail,
        customerName: customerName,
        orderId: orderId,
        orderAmount: orderAmount,
        orderDate: orderDate,
        orderItems: orderItems,
        subject: expect.stringContaining('注文確定'),
      })
    );

    expect(result.orderStatus).toBe('確定');
    expect(result.notificationSent).toBe(true);
    expect(result.notificationLog).toEqual(
      expect.objectContaining({
        orderId: orderId,
        notificationType: 'order_confirmation',
        recipientEmail: customerEmail,
        deliveryStatus: 'sent',
        messageId: 'msg-20240115-001',
        sentAt: '2024-01-15T10:30:00Z',
      })
    );
    expect(result.errorMessage).toBeUndefined();
  });
});