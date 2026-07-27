import { verifyInvoiceApproval } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-896: [error] 請求書承認検証機能 - 請求書の金額が商談の契約金額と不一致のとき検証が不合格になる
  test('請求書金額が商談契約金額と不一致のとき検証が不合格になる', () => {
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({ fileId: 'file-123' }),
      generateShareLink: jest.fn().mockResolvedValue({ shareLink: 'https://example.com/share' }),
      deleteDocument: jest.fn().mockResolvedValue(true),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue(true),
      sendOrderNotification: jest.fn().mockResolvedValue(true),
      sendInvoiceNotification: jest.fn().mockResolvedValue(true),
      getDeliveryStatus: jest.fn().mockResolvedValue({ status: 'delivered' }),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({ paymentLink: 'https://payment.example.com' }),
      verifyPayment: jest.fn().mockResolvedValue({ verified: false }),
      getTransactionStatus: jest.fn().mockResolvedValue({ status: 'pending' }),
    };

    const dealRecord = {
      dealId: 'deal-001',
      customerId: 'cust-001',
      contractAmount: 500000,
      status: 'won',
      createdAt: new Date('2024-01-15T10:00:00Z'),
    };

    const invoiceRecord = {
      invoiceId: 'inv-001',
      dealId: 'deal-001',
      customerId: 'cust-001',
      invoiceAmount: 450000,
      status: 'pending_approval',
      items: [
        {
          itemId: 'item-001',
          description: 'Service A',
          quantity: 1,
          unitPrice: 450000,
          lineTotal: 450000,
        },
      ],
      createdAt: new Date('2024-01-15T11:00:00Z'),
    };

    const result = verifyInvoiceApproval(
      invoiceRecord,
      dealRecord,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter,
    );

    expect(result.isApproved).toBe(false);
    expect(result.status).toBe('承認却下');
    expect(result.errorMessage).toMatch(/請求書金額が商談の契約金額と一致しません/);
    expect(result.errorMessage).toContain('450,000');
    expect(result.errorMessage).toContain('500,000');
  });
});