import { issueQuote } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル商談情報参照機能 - 帳票発行時の発行日時自動付与と発行履歴記録', () => {
  test('SCEN-087: 見積書の発行履歴に帳票タイプが正確に記録される', () => {
    // Arrange
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'doc-20240115-001',
        fileUrl: 'https://storage.example.com/quotes/doc-20240115-001.pdf',
        uploadedAt: '2024-01-15T11:30:45Z',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://share.example.com/doc-20240115-001',
        expiresAt: '2024-01-22T11:30:45Z',
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: 'msg-20240115-001',
        sentAt: '2024-01-15T11:30:46Z',
        recipientEmail: 'customer@example.com',
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({}),
      sendInvoiceNotification: jest.fn().mockResolvedValue({}),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: 'delivered',
        openedAt: null,
      }),
    };

    const quoteInput = {
      customerId: 'cust-12345',
      customerName: 'ABC Corporation',
      customerEmail: 'customer@example.com',
      quoteDate: '2024-01-15T11:30:00Z',
      lineItems: [
        {
          itemId: 'item-001',
          productName: 'Product A',
          quantity: 10,
          unitPrice: 1000,
          totalPrice: 10000,
        },
      ],
      totalAmount: 10000,
      validUntil: '2024-02-15',
      notes: 'Standard commercial terms apply',
    };

    const issuanceTimestamp = '2024-01-15T11:30:00Z';

    // Act
    const result = issueQuote(
      quoteInput,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      issuanceTimestamp
    );

    // Assert
    expect(result).toEqual({
      success: true,
      quoteId: expect.any(String),
      issueHistory: {
        documentType: 'QUOTE',
        documentTypeLabel: '見積書',
        issuedAt: '2024-01-15T11:30:00Z',
        status: '発行済み',
        customerId: 'cust-12345',
        customerName: 'ABC Corporation',
        documentStorageReference: {
          documentId: 'doc-20240115-001',
          fileUrl: 'https://storage.example.com/quotes/doc-20240115-001.pdf',
          uploadedAt: '2024-01-15T11:30:45Z',
        },
        notificationReference: {
          messageId: 'msg-20240115-001',
          sentAt: '2024-01-15T11:30:46Z',
          recipientEmail: 'customer@example.com',
        },
      },
      pdfUrl: 'https://storage.example.com/quotes/doc-20240115-001.pdf',
      shareLink: 'https://share.example.com/doc-20240115-001',
    });

    // Verify adapter calls
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(1);
    expect(mockDocumentStorageAdapter.generateShareLink).toHaveBeenCalledTimes(1);
    expect(mockNotificationServiceAdapter.sendQuoteNotification).toHaveBeenCalledTimes(1);
    expect(mockNotificationServiceAdapter.sendQuoteNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: 'cust-12345',
        customerEmail: 'customer@example.com',
        customerName: 'ABC Corporation',
      })
    );

    // Verify issue history record content
    expect(result.issueHistory.documentType).toBe('QUOTE');
    expect(result.issueHistory.documentTypeLabel).toBe('見積書');
    expect(result.issueHistory.issuedAt).toBe('2024-01-15T11:30:00Z');
    expect(result.issueHistory.status).toBe('発行済み');
    expect(result.issueHistory.customerName).toBe('ABC Corporation');
    expect(result.issueHistory.documentStorageReference.documentId).toBe('doc-20240115-001');
  });
});