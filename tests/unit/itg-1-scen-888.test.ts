import { validateInvoiceForApproval } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-888
  test('請求書の通貨が欠落しているとき検証が不合格になる', () => {
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({ fileId: 'file-123' }),
      generateShareLink: jest.fn().mockResolvedValue({ shareLink: 'https://example.com/share' }),
      deleteDocument: jest.fn().mockResolvedValue(true),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({ status: 'sent' }),
      sendOrderNotification: jest.fn().mockResolvedValue({ status: 'sent' }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({ status: 'sent' }),
      getDeliveryStatus: jest.fn().mockResolvedValue({ delivered: true }),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({ paymentLink: 'https://payment.example.com/link123' }),
      verifyPayment: jest.fn().mockResolvedValue({ verified: true }),
      getTransactionStatus: jest.fn().mockResolvedValue({ status: 'completed' }),
    };

    const invoiceWithMissingCurrency = {
      invoiceNumber: 'INV-001',
      amount: 10000,
      customerName: 'テスト太郎',
      dueDate: '2024-12-31',
    };

    const result = validateInvoiceForApproval(
      invoiceWithMissingCurrency,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    expect(result).toHaveProperty('isValid', false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        field: 'currency',
        message: expect.stringMatching(/通貨|currency/),
      })
    );

    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).not.toHaveBeenCalled();
  });
});