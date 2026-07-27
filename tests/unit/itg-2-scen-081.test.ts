import { issueQuote } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 商談情報参照機能', () => {
  // SCEN-081: [normal] 帳票発行時の発行日時自動付与と発行履歴記録 - 見積書の発行履歴に営業担当者IDが正確に記録される
  test('見積書発行時に営業担当者IDと発行日時が履歴に記録される', () => {
    const salesPersonId = 'SALES-001';
    const customerId = 'CUST-100';
    const customerEmail = 'test@example.com';
    const quoteId = 'QUOTE-20240115-001';
    const issueTimestamp = new Date('2024-01-15T11:30:00Z');

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'DOC-12345',
        storageUrl: 'https://storage.example.com/quotes/QUOTE-20240115-001.pdf',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://drive.example.com/share/ABC123XYZ',
        expiresAt: new Date('2024-01-22T11:30:00Z'),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: 'MSG-67890',
        deliveryStatus: 'sent',
        sentAt: issueTimestamp,
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({}),
      sendInvoiceNotification: jest.fn().mockResolvedValue({}),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: 'delivered',
        openedAt: null,
      }),
    };

    const quoteData = {
      quoteId: quoteId,
      customerId: customerId,
      customerEmail: customerEmail,
      lineItems: [
        {
          productId: 'PROD-001',
          productName: 'ライセンス年間契約',
          quantity: 1,
          unitPrice: 100000,
          totalPrice: 100000,
        },
      ],
      totalAmount: 100000,
      validUntil: new Date('2024-02-15T23:59:59Z'),
    };

    const result = issueQuote(
      {
        salesPersonId: salesPersonId,
        customerId: customerId,
        customerEmail: customerEmail,
        quoteData: quoteData,
        issuedAt: issueTimestamp,
      },
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter
    );

    expect(result.quoteHistory).toBeDefined();
    expect(result.quoteHistory.salesPersonId).toBe(salesPersonId);
    expect(result.quoteHistory.customerId).toBe(customerId);
    expect(result.quoteHistory.quoteId).toBe(quoteId);
    expect(new Date(result.quoteHistory.issuedAt).getTime()).toBe(issueTimestamp.getTime());
    expect(result.quoteHistory.status).toBe('issued');
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        quoteId: quoteId,
        customerId: customerId,
      })
    );
    expect(mockNotificationServiceAdapter.sendQuoteNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: customerId,
        customerEmail: customerEmail,
        quoteId: quoteId,
      })
    );
  });
});