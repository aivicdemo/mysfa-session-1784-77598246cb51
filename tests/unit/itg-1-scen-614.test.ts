import { generateAndSaveInvoiceDetails } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-614
  test('請求書発行時、請求明細レコードを営業管理システムのDBに保存する', async () => {
    // Arrange
    const customerId = 'CUST-001';
    const customerName = 'テスト顧客A';
    const customerEmail = 'test@example.com';
    const transactionId = 'TXN-12345';
    const productName = 'サーバーライセンス';
    const quantity = 2;
    const unitPrice = 50000;
    const taxRate = 0.1;

    const expectedInvoiceAmount = 110000; // (50000 * 2) * 1.1
    const expectedTaxAmount = 10000; // 50000 * 2 * 0.1
    const invoiceDateString = '2024-01-15';
    const currentDateTimeString = '2024-01-15T11:00:00Z';

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'DOC-001',
        fileUrl: 'https://storage.example.com/invoice-001.pdf',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://share.example.com/token-abc123',
        expiresAt: '2024-01-22T11:00:00Z',
      }),
      deleteDocument: jest.fn().mockResolvedValue({}),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: 'MSG-001',
        deliveryStatus: 'sent',
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        messageId: 'MSG-002',
        deliveryStatus: 'sent',
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: 'MSG-003',
        deliveryStatus: 'sent',
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        messageId: 'MSG-003',
        status: 'delivered',
        openedAt: null,
      }),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLinkId: 'LINK-001',
        paymentUrl: 'https://payment.example.com/checkout/LINK-001',
        expiresAt: '2024-02-15T11:00:00Z',
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        transactionId: 'TRX-001',
        status: 'completed',
        amount: 110000,
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        transactionId: 'TRX-001',
        status: 'completed',
      }),
    };

    const inputData = {
      customerId,
      customerName,
      customerEmail,
      transactionId,
      productName,
      quantity,
      unitPrice,
      taxRate,
      invoiceDate: invoiceDateString,
      currentDateTime: currentDateTimeString,
    };

    // Act
    const result = await generateAndSaveInvoiceDetails(
      inputData,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    // Assert
    expect(result).toBeDefined();
    expect(result.invoiceId).toBeDefined();
    expect(result.customerId).toBe(customerId);
    expect(result.transactionId).toBe(transactionId);
    expect(result.invoiceAmount).toBe(expectedInvoiceAmount);
    expect(result.taxAmount).toBe(expectedTaxAmount);
    expect(result.invoiceDate).toBe(invoiceDateString);
    expect(result.status).toBe('発行済');
    expect(result.createdAt).toBe(currentDateTimeString);

    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(1);
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalledTimes(1);
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledTimes(1);

    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: result.invoiceId,
        customerId,
        amount: expectedInvoiceAmount,
      })
    );

    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        customerEmail,
        customerId,
        invoiceId: result.invoiceId,
      })
    );

    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: result.invoiceId,
        amount: expectedInvoiceAmount,
      })
    );
  });
});