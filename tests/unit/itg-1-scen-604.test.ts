import { generateInvoiceWithNotification } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-604
  test('請求書自動生成後、NotificationServiceAdapterのsendInvoiceNotificationで顧客メールアドレスへ請求書通知を送信する', () => {
    // Arrange
    const mockNotificationService = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        success: true,
        messageId: 'msg-20240115-001',
        sentAt: '2024-01-15T10:30:00Z',
      }),
    };

    const customerData = {
      customerId: 'CUST-001',
      customerName: '株式会社テスト',
      customerEmail: 'test-customer@example.com',
    };

    const invoiceData = {
      invoiceId: 'INV-2024-001',
      amount: 150000,
      invoiceDate: '2024-01-15',
      invoiceContent: '商品A ×5個、商品B ×3個',
      dueDate: '2024-02-15',
    };

    // Act
    generateInvoiceWithNotification(
      customerData,
      invoiceData,
      mockNotificationService
    );

    // Assert
    expect(mockNotificationService.sendInvoiceNotification).toHaveBeenCalledTimes(
      1
    );

    const callArgs =
      mockNotificationService.sendInvoiceNotification.mock.calls[0][0];

    expect(callArgs.customerEmail).toBe('test-customer@example.com');
    expect(callArgs.invoiceId).toBe('INV-2024-001');
    expect(callArgs.amount).toBe(150000);
    expect(callArgs.invoiceDate).toBe('2024-01-15');
    expect(callArgs.invoiceContent).toBe('商品A ×5個、商品B ×3個');
    expect(callArgs.dueDate).toBe('2024-02-15');
  });
});