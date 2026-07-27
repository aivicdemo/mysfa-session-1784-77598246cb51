import { invoiceApprovalValidation } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-866
  test('請求書承認検証機能 - 請求書の発行日が月初のとき検証が合格する', () => {
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: 'file-001',
        uploadedAt: new Date('2024-01-01T10:00:00Z'),
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        notificationId: 'notif-001',
        sentAt: new Date('2024-01-01T10:05:00Z'),
      }),
      getDeliveryStatus: jest.fn(),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentUrl: 'https://payment.example.com/pay?token=abc123',
        expiresAt: new Date('2024-01-15T23:59:59Z'),
      }),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    const invoiceObject = {
      invoiceNumber: 'INV-2024-001',
      issueDate: new Date('2024-01-01'),
      amount: 100000,
      customerName: 'テスト顧客',
      customerId: 'CUST-001',
      items: [
        {
          description: 'サービス料金',
          quantity: 1,
          unitPrice: 100000,
        },
      ],
      dueDate: new Date('2024-01-31'),
    };

    const validationResult = invoiceApprovalValidation(
      invoiceObject,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    expect(validationResult.isValid).toBe(true);
    expect(validationResult.validationStatus).toBe('APPROVED');
    expect(validationResult.errorMessages).toEqual([]);
  });
});