import { calculateSalesInvoiceDiscrepancy } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-661
  test('売上計上予定日と請求書発行日が同じ月の末日をまたぐとき、正確なズレ日数が計算される', () => {
    // Arrange
    const salesRecordedDate = new Date('2024-01-31T00:00:00Z');
    const invoiceIssuedDate = new Date('2024-02-01T00:00:00Z');

    // スタブ: DocumentStorageAdapter
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: 'mock-file-id-001',
        url: 'https://mock-storage.example.com/doc-001.pdf',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://mock-storage.example.com/share/abc123',
        expiresAt: '2024-02-15T00:00:00Z',
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // スタブ: NotificationServiceAdapter
    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        status: 'sent',
        messageId: 'msg-quote-001',
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        status: 'sent',
        messageId: 'msg-order-001',
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        status: 'sent',
        messageId: 'msg-invoice-001',
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        delivered: true,
        opened: true,
        openedAt: '2024-02-01T12:30:00Z',
      }),
    };

    // スタブ: PaymentGatewayAdapter
    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLink: 'https://mock-payment.example.com/pay/xyz789',
        transactionId: 'txn-001',
        expiresAt: '2024-02-08T00:00:00Z',
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        verified: true,
        paymentStatus: 'completed',
        paidAt: '2024-02-02T14:00:00Z',
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        transactionId: 'txn-001',
        status: 'completed',
        amount: 100000,
      }),
    };

    // Act
    const discrepancyResult = calculateSalesInvoiceDiscrepancy(
      salesRecordedDate,
      invoiceIssuedDate,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    // Assert
    expect(discrepancyResult).toBeDefined();
    expect(discrepancyResult.discrepancyDays).toBe(1);
    expect(discrepancyResult.salesRecordedDate).toEqual(new Date('2024-01-31T00:00:00Z'));
    expect(discrepancyResult.invoiceIssuedDate).toEqual(new Date('2024-02-01T00:00:00Z'));
    expect(discrepancyResult.isMonthlyBoundary).toBe(true);
    expect(discrepancyResult.documentUploadSuccess).toBe(true);
    expect(discrepancyResult.notificationSent).toBe(true);
    expect(discrepancyResult.paymentLinkGenerated).toBe(true);
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalled();
  });
});