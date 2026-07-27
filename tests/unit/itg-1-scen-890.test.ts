import { verifyInvoiceApprovalAlignment } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-890
  test('請求書承認検証機能 - 商談のステータスと請求書発行状況が完全に一致するとき、ズレ検出が陰性を返す', () => {
    const dealId = 'DEAL-001';
    const invoiceId = 'INV-001';
    const contractAmount = 100000;
    const taxRate = 0.1;
    const invoiceAmount = contractAmount * (1 + taxRate);

    const mockDeal = {
      dealId: dealId,
      dealStatus: '契約成立',
      contractAmount: contractAmount,
      contractedAt: '2024-01-15T10:00:00Z',
      details: [
        {
          productId: 'PROD-001',
          productName: 'テスト商品',
          quantity: 2,
          unitPrice: 50000,
        },
      ],
    };

    const mockInvoice = {
      invoiceId: invoiceId,
      dealId: dealId,
      invoiceStatus: '発行済み',
      invoiceAmount: invoiceAmount,
      taxAmount: contractAmount * taxRate,
      taxRate: taxRate,
      issuedAt: '2024-01-15T11:00:00Z',
      details: [
        {
          productId: 'PROD-001',
          productName: 'テスト商品',
          quantity: 2,
          unitPrice: 50000,
          lineAmount: 100000,
        },
      ],
    };

    const mockDataSource = {
      getDealById: jest.fn().mockResolvedValue(mockDeal),
      getInvoiceByDealId: jest.fn().mockResolvedValue(mockInvoice),
    };

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        status: 200,
        documentUrl: 'https://example.com/invoices/INV-001.pdf',
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const mockNotificationServiceAdapter = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        status: 200,
        messageId: 'msg-001',
      }),
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        status: 200,
        paymentUrl: 'https://payment.example.com/pay/INV-001',
      }),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    return verifyInvoiceApprovalAlignment(
      dealId,
      mockDataSource,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    ).then((result) => {
      expect(result.isAligned).toBe(true);
      expect(result.discrepancies).toEqual([]);
      expect(result.validationTimestamp).toBeDefined();
      expect(typeof result.validationTimestamp).toBe('string');

      expect(mockDataSource.getDealById).toHaveBeenCalledWith(dealId);
      expect(mockDataSource.getInvoiceByDealId).toHaveBeenCalledWith(dealId);

      expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
      expect(mockNotificationServiceAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
      expect(mockPaymentGatewayAdapter.generatePaymentLink).not.toHaveBeenCalled();
    });
  });
});