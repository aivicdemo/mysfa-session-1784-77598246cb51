import { generateInvoiceAutomatically } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-592: [edge] 請求書自動生成機能 - 複数の見積明細を合算した請求金額が業務上の最大規模金額に達する場合、正しく計算される
  test('複数の見積明細を合算した請求金額が最大規模金額に到達する場合、正確に計算される', () => {
    const invoiceLineItem1 = {
      lineItemId: 'line-001',
      description: '商品A',
      quantity: 1,
      unitPrice: 333333333,
      amountExcludingTax: 333333333,
    };

    const invoiceLineItem2 = {
      lineItemId: 'line-002',
      description: '商品B',
      quantity: 1,
      unitPrice: 333333333,
      amountExcludingTax: 333333333,
    };

    const invoiceLineItem3 = {
      lineItemId: 'line-003',
      description: '商品C',
      quantity: 1,
      unitPrice: 333333333,
      amountExcludingTax: 333333333,
    };

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        status: 200,
        documentId: 'doc-123456',
        url: 'https://storage.example.com/doc-123456',
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        status: 200,
        messageId: 'msg-789',
        sentAt: '2024-01-15T11:00:00Z',
      }),
      getDeliveryStatus: jest.fn(),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        status: 200,
        paymentLink: 'https://payment.example.com/link-xyz',
        expiryAt: '2024-02-15T11:00:00Z',
      }),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    const invoiceData = {
      invoiceId: 'inv-20240115-001',
      customerId: 'cust-abc123',
      customerName: '顧客企業A',
      customerEmail: 'contact@customer-a.example.com',
      invoiceDate: '2024-01-15',
      dueDate: '2024-02-15',
      lineItems: [invoiceLineItem1, invoiceLineItem2, invoiceLineItem3],
      taxRate: 0.1,
      documentStorageAdapter: mockDocumentStorageAdapter,
      notificationServiceAdapter: mockNotificationServiceAdapter,
      paymentGatewayAdapter: mockPaymentGatewayAdapter,
    };

    const result = generateInvoiceAutomatically(invoiceData);

    expect(result.amountExcludingTax).toBe(999999999);
    expect(result.taxAmount).toBe(99999999);
    expect(result.amountIncludingTax).toBe(1099999998);

    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(1);
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: 'inv-20240115-001',
        amountExcludingTax: 999999999,
        taxAmount: 99999999,
        amountIncludingTax: 1099999998,
      })
    );

    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalledTimes(1);
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: 'inv-20240115-001',
        customerEmail: 'contact@customer-a.example.com',
        customerName: '顧客企業A',
      })
    );

    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledTimes(1);
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: 'inv-20240115-001',
        amountIncludingTax: 1099999998,
      })
    );
  });
});