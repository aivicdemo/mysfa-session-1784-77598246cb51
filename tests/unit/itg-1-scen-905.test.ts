import { validateInvoiceApproval } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  test('SCEN-905: 請求書承認検証機能 - 請求書に紐付く見積レコードが存在するとき検証が合格する', async () => {
    // Arrange
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: 'doc-123',
        url: 'https://storage.example.com/doc-123'
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://share.example.com/token-abc'
      }),
      deleteDocument: jest.fn().mockResolvedValue(true)
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: 'msg-001',
        status: 'sent'
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        messageId: 'msg-002',
        status: 'sent'
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: 'msg-003',
        status: 'sent'
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        delivered: true,
        opened: true
      })
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLinkId: 'pl-001',
        paymentUrl: 'https://payment.example.com/pl-001'
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        transactionId: 'txn-001',
        status: 'completed'
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        transactionId: 'txn-001',
        status: 'completed',
        amount: 100000
      })
    };

    const quoteRecord = {
      quoteId: 'QT-20250115-001',
      customerName: 'テスト太郎',
      amount: 100000,
      status: '承認済み'
    };

    const invoiceRecord = {
      invoiceId: 'INV-20250115-001',
      customerName: 'テスト太郎',
      amount: 100000,
      quoteId: 'QT-20250115-001',
      status: '未承認'
    };

    // Act
    const result = await validateInvoiceApproval(
      invoiceRecord,
      quoteRecord,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    // Assert
    expect(result.validationStatus).toBe('合格');
    expect(result.invoiceStatus).toBe('承認済み');
    expect(result.isQuoteLinked).toBe(true);
    expect(result.linkedQuoteId).toBe('QT-20250115-001');
    expect(result.invoiceId).toBe('INV-20250115-001');
    expect(result.customerName).toBe('テスト太郎');
    expect(result.amount).toBe(100000);
  });
});