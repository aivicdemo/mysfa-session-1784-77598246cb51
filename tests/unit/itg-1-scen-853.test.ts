import { validateInvoiceForApproval } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-853: [error] 請求書承認検証機能 - 請求書の金額が 0 のとき検証が不合格になる
  test('請求書の金額が0のとき検証エラーを返し、ステータスが検証エラーに遷移する', () => {
    // Arrange
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

    const invoiceWithZeroAmount = {
      invoiceId: 'INV-20240101-001',
      customerId: 'CUST-001',
      customerName: '株式会社テスト',
      customerEmail: 'test@example.com',
      invoiceDate: '2024-01-01',
      dueDate: '2024-02-01',
      totalAmount: 0,
      currency: 'JPY',
      items: [
        {
          itemId: 'ITEM-001',
          description: '商品A',
          quantity: 1,
          unitPrice: 0,
          amount: 0,
        },
      ],
      status: '承認待ち',
      notes: '',
    };

    // Act
    const result = validateInvoiceForApproval(
      invoiceWithZeroAmount,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    // Assert
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toMatch(/金額|0/);
    expect(result.newStatus).toBe('検証エラー');
    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).not.toHaveBeenCalled();
  });
});