import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { issueQuote } from '../../src/logic/it-1784969823049-2-1-2';

// Mock adapter types
interface DocumentStorageAdapterStub {
  uploadDocument: jest.Mock;
  generateShareLink: jest.Mock;
  deleteDocument: jest.Mock;
}

interface NotificationServiceAdapterStub {
  sendQuoteNotification: jest.Mock;
  sendOrderNotification: jest.Mock;
  sendInvoiceNotification: jest.Mock;
  getDeliveryStatus: jest.Mock;
}

describe('Customer Portal - Quote Issuance with Auto-Timestamp', () => {
  // SCEN-069
  test('should record issued quote with exact timestamp when issued at month start', async () => {
    // Arrange: Mock current date to 2024-01-01 09:30:00 (month start)
    const mockIssuedAt = new Date('2024-01-01T09:30:00Z');
    jest.useFakeTimers();
    jest.setSystemTime(mockIssuedAt);

    const mockDocumentStorageAdapter: DocumentStorageAdapterStub = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'doc-quote-001',
        storageUrl: 'https://drive.example.com/quote-2024-01-01.pdf',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://drive.example.com/share/quote-001-token',
        expiresAt: new Date('2024-01-02T09:30:00Z'),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockNotificationServiceAdapter: NotificationServiceAdapterStub = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: 'msg-quote-001',
        deliveryStatus: 'sent',
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({}),
      sendInvoiceNotification: jest.fn().mockResolvedValue({}),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: 'delivered',
        openedAt: null,
      }),
    };

    const authenticatedUserId = 'user-cust-001';
    const quoteData = {
      customerId: 'cust-acme-001',
      quoteNumber: 'QT-2024-001',
      items: [
        {
          productId: 'prod-service-001',
          productName: 'Consulting Service',
          quantity: 10,
          unitPrice: 5000,
          totalPrice: 50000,
        },
      ],
      subtotal: 50000,
      tax: 5000,
      total: 55000,
      validUntilDate: '2024-02-01',
      customerEmail: 'contact@acme.example.com',
      customerName: 'ACME Corporation',
    };

    // Act: Call the issue quote function
    const result = await issueQuote(
      {
        userId: authenticatedUserId,
        quoteData,
      },
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter
    );

    // Assert: Verify the exact issued timestamp is recorded
    expect(result.issuanceRecord.issuedAt).toBe('2024-01-01T09:30:00Z');
    expect(result.issuanceRecord.issuanceTimestampISO).toBe('2024-01-01T09:30:00Z');

    // Assert: Verify DocumentStorageAdapter was called with correct metadata
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(1);
    const uploadCall = mockDocumentStorageAdapter.uploadDocument.mock.calls[0];
    expect(uploadCall[0]).toMatchObject({
      documentType: 'quote',
      quoteNumber: 'QT-2024-001',
      timestamp: '2024-01-01T09:30:00Z',
    });

    // Assert: Verify NotificationServiceAdapter was called
    expect(mockNotificationServiceAdapter.sendQuoteNotification).toHaveBeenCalledTimes(1);
    const notificationCall = mockNotificationServiceAdapter.sendQuoteNotification.mock.calls[0];
    expect(notificationCall[0]).toMatchObject({
      recipientEmail: 'contact@acme.example.com',
      quoteNumber: 'QT-2024-001',
      issuedAt: '2024-01-01T09:30:00Z',
    });

    // Assert: Verify the response indicates successful completion
    expect(result.status).toBe('issued');
    expect(result.message).toContain('発行完了');
    expect(result.quoteId).toBeDefined();
    expect(result.storageUrl).toBe('https://drive.example.com/quote-2024-01-01.pdf');

    // Assert: Verify history record was created with month-start timestamp
    expect(result.issuanceRecord).toMatchObject({
      quoteNumber: 'QT-2024-001',
      customerId: 'cust-acme-001',
      issuedAt: '2024-01-01T09:30:00Z',
      issuedByUserId: authenticatedUserId,
      documentStorageUrl: 'https://drive.example.com/quote-2024-01-01.pdf',
    });

    jest.useRealTimers();
  });
});