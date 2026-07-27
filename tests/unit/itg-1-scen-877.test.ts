import { approveInvoice } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-877
  test('請求書承認検証機能 - 請求明細の単価が負数のとき検証が不合格になる', () => {
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({ documentId: 'doc-123' }),
      generateShareLink: jest.fn().mockResolvedValue({ shareUrl: 'https://example.com/share/doc-123' }),
      deleteDocument: jest.fn().mockResolvedValue({}),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({}),
      sendOrderNotification: jest.fn().mockResolvedValue({}),
      sendInvoiceNotification: jest.fn().mockResolvedValue({}),
      getDeliveryStatus: jest.fn().mockResolvedValue({ status: 'delivered' }),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({ paymentLink: 'https://payment.example.com/pay-123' }),
      verifyPayment: jest.fn().mockResolvedValue({ verified: true }),
      getTransactionStatus: jest.fn().mockResolvedValue({ status: 'completed' }),
    };

    const invoiceData = {
      invoiceId: 'INV-2024-001',
      customerId: 'CUST-0001',
      customerName: '株式会社サンプル',
      invoiceDate: '2024-01-15',
      dueDate: '2024-02-15',
      totalAmount: 0,
      invoiceDetails: [
        {
          detailId: 'detail-001',
          productName: 'コンサルティングサービス',
          quantity: 10,
          unitPrice: -1000,
          taxRate: 0.1,
        },
      ],
      approvalStatus: 'pending',
    };

    expect(() =>
      approveInvoice(invoiceData, mockDocumentStorageAdapter, mockNotificationServiceAdapter, mockPaymentGatewayAdapter)
    ).toThrow(/単価/);
  });
});