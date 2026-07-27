import { confirmOrder } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 商談情報参照機能', () => {
  // SCEN-157
  test('Google Workspace メール API連携 - sendOrderNotificationが成功応答を返した場合、注文確定時に顧客メールアドレスへメールが送信される', () => {
    // Arrange
    const mockNotificationServiceAdapter = {
      sendOrderNotification: jest.fn().mockResolvedValue({
        success: true,
        messageId: '12345',
        timestamp: '2024-01-01T00:00:00Z',
      }),
    };

    const customerEmail = 'customer@example.com';
    const orderId = 'ORD-2024-001';
    const orderDetails = {
      orderId: 'ORD-2024-001',
      customerId: 'CUST-001',
      items: [
        {
          productId: 'PROD-001',
          productName: 'Product A',
          quantity: 2,
          unitPrice: 10000,
          totalPrice: 20000,
        },
        {
          productId: 'PROD-002',
          productName: 'Product B',
          quantity: 1,
          unitPrice: 15000,
          totalPrice: 15000,
        },
      ],
      totalAmount: 35000,
      orderDate: '2024-01-01T10:00:00Z',
    };

    const orderPayload = {
      customerId: 'CUST-001',
      customerEmail: customerEmail,
      orderId: orderId,
      orderDetails: orderDetails,
    };

    // Act
    const result = confirmOrder(orderPayload, mockNotificationServiceAdapter);

    // Assert
    expect(result.status).toBe('確定済み');
    expect(result.orderId).toBe('ORD-2024-001');

    expect(mockNotificationServiceAdapter.sendOrderNotification).toHaveBeenCalledTimes(1);

    const callArgs = mockNotificationServiceAdapter.sendOrderNotification.mock.calls[0][0];
    expect(callArgs.recipientEmail).toBe('customer@example.com');
    expect(callArgs.orderId).toBe('ORD-2024-001');
    expect(callArgs.orderDetails).toEqual(orderDetails);
    expect(callArgs.body).toContain('ORD-2024-001');
    expect(callArgs.body).toContain('Product A');
    expect(callArgs.body).toContain('Product B');
    expect(callArgs.body).toContain('35000');

    expect(result.emailSendLog).toEqual({
      messageId: '12345',
      timestamp: '2024-01-01T00:00:00Z',
      status: 'sent',
    });
  });
});