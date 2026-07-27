import { validateInvoiceApproval } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-861
  test('請求書承認検証機能 - 顧客の企業名が欠落しているとき検証が不合格になる', () => {
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

    const invoiceDataWithoutCompanyName = {
      invoiceId: 'INV-2024-001',
      customerId: 'CUST-001',
      customerName: '山田太郎',
      customerCompanyName: '',
      invoiceAmount: 150000,
      invoiceDate: '2024-01-15',
      paymentDeadline: '2024-02-15',
      lineItems: [
        {
          itemId: 'ITEM-001',
          description: 'コンサルティングサービス',
          quantity: 1,
          unitPrice: 150000,
          totalPrice: 150000,
        },
      ],
    };

    const result = validateInvoiceApproval(
      invoiceDataWithoutCompanyName,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    expect(result.isApproved).toBe(false);
    expect(result.validationErrors).toContain(/企業名/);
    expect(result.status).toBe('pending_approval');
    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).not.toHaveBeenCalled();
  });
});