import { generateInvoice } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-597
  test('商談ステータスが失注の場合、請求書生成が失敗する', () => {
    const mockDocumentStorage = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const mockNotificationService = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const mockPaymentGateway = {
      generatePaymentLink: jest.fn(),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    const dealRecord = {
      id: 'deal-001',
      customer_id: 'cust-001',
      customer_name: 'Test Customer Inc.',
      status: '失注',
      amount: 500000,
      currency: 'JPY',
      line_items: [
        {
          product_id: 'prod-001',
          description: 'Software License',
          quantity: 1,
          unit_price: 500000,
        },
      ],
      created_at: new Date('2024-01-15T10:00:00Z'),
      updated_at: new Date('2024-01-15T10:00:00Z'),
    };

    expect(() =>
      generateInvoice(
        dealRecord,
        mockDocumentStorage,
        mockNotificationService,
        mockPaymentGateway,
      ),
    ).toThrow(/失注/);

    expect(mockDocumentStorage.uploadDocument).not.toHaveBeenCalled();
    expect(mockNotificationService.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(mockPaymentGateway.generatePaymentLink).not.toHaveBeenCalled();
  });
});