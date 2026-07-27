import { validateInvoice } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-900
  test('請求書の発行日が未来日のとき検証が不合格になる', () => {
    // Arrange
    const today = new Date('2024-01-15T00:00:00Z');
    const futureDate = new Date('2024-02-14T00:00:00Z'); // 30日後

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

    const invoiceData = {
      invoiceNumber: 'INV-2024-001',
      customerId: 'CUST-12345',
      customerName: '株式会社テスト',
      issueDate: futureDate,
      dueDate: new Date('2024-02-28T00:00:00Z'),
      totalAmount: 150000,
      items: [
        {
          description: 'コンサルティングサービス',
          quantity: 1,
          unitPrice: 150000,
          amount: 150000,
        },
      ],
      dealId: 'DEAL-99999',
    };

    // Act
    const result = validateInvoice(
      invoiceData,
      today,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    // Assert
    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe('INVALID_ISSUE_DATE_FUTURE');
    expect(result.errorMessage).toMatch(/発行日/);
    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).not.toHaveBeenCalled();
  });
});