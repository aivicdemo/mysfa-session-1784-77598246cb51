import { validateInvoiceApproval } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-883: [edge] 請求書承認検証機能 - 請求書の割引率が 0%のとき検証が合格する
  test('割引率が0%の請求書は検証が合格し、割引額が0円として計算される', () => {
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({ documentId: 'doc-001', fileUrl: 'https://storage.example.com/doc-001.pdf' }),
      generateShareLink: jest.fn().mockResolvedValue({ shareLink: 'https://share.example.com/abc123', expiresAt: '2024-12-31T23:59:59Z' }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({ messageId: 'msg-001', status: 'sent' }),
      sendOrderNotification: jest.fn().mockResolvedValue({ messageId: 'msg-002', status: 'sent' }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({ messageId: 'msg-003', status: 'sent' }),
      getDeliveryStatus: jest.fn().mockResolvedValue({ delivered: true, openedAt: '2024-01-15T12:30:00Z' }),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({ paymentLink: 'https://payment.example.com/pay-001', transactionId: 'txn-001' }),
      verifyPayment: jest.fn().mockResolvedValue({ verified: true, paidAt: '2024-01-15T11:00:00Z' }),
      getTransactionStatus: jest.fn().mockResolvedValue({ status: 'completed', amount: 10000 }),
    };

    const invoiceData = {
      invoiceId: 'INV-2024-001',
      customerId: 'CUST-001',
      customerName: '山田商事',
      customerEmail: 'contact@yamada-shoji.example.com',
      dealId: 'DEAL-001',
      dealStatus: 'won',
      lineItems: [
        {
          itemId: 'ITEM-001',
          itemName: '商品A',
          quantity: 10,
          unitPrice: 1000,
          subtotal: 10000,
        },
      ],
      subtotalAmountExcludingTax: 10000,
      discountRate: 0,
      discountAmount: 0,
      taxRate: 0.1,
      taxAmount: 1000,
      totalAmount: 11000,
      issuedDate: '2024-01-15T10:00:00Z',
      dueDate: '2024-02-15T23:59:59Z',
      approvalStatus: 'pending',
    };

    const result = validateInvoiceApproval(
      invoiceData,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter,
    );

    expect(result.isValid).toBe(true);
    expect(result.approvalStatus).toBe('approved');
    expect(result.calculatedDiscountAmount).toBe(0);
    expect(result.finalAmount).toBe(11000);
    expect(result.errors).toEqual([]);
  });
});