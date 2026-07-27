import { generateInvoiceFromDeal } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  test('SCEN-593: 顧客メールアドレスが空白の場合、請求書生成が失敗する', () => {
    // Arrange
    const mockNotificationService = {
      sendInvoiceNotification: jest.fn(),
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const dealRecord = {
      dealId: 'DEAL-20240115-001',
      customerId: 'CUST-0042',
      customerName: 'テスト商社株式会社',
      customerEmail: '',
      amount: 150000,
      currency: 'JPY',
      productCode: 'PROD-2024-A',
      productName: 'クラウドライセンス1年間',
      quantity: 5,
      unitPrice: 30000,
      dealStatus: '受注',
      dealDate: new Date('2024-01-15T09:00:00Z'),
    };

    // Act & Assert
    expect(() => {
      generateInvoiceFromDeal(dealRecord, mockNotificationService);
    }).toThrow(/メールアドレス/);

    // Assert: NotificationService の sendInvoiceNotification が呼び出されないことを確認
    expect(mockNotificationService.sendInvoiceNotification).not.toHaveBeenCalled();
  });
});