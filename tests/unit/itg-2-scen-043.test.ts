import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { issueOrderDocument } from '../../src/logic/it-1784969823049-2-1-2';

describe('Customer Portal Order Document Issue', () => {
  let mockDocumentStorageAdapter: any;
  let mockNotificationServiceAdapter: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'doc-12345',
        savedAt: '2024-01-15T11:30:00Z',
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    mockNotificationServiceAdapter = {
      sendOrderNotification: jest.fn().mockResolvedValue({
        emailId: 'email-67890',
        deliveryStartedAt: '2024-01-15T11:30:01Z',
      }),
      sendQuoteNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };
  });

  // SCEN-043
  test('should record order issue history with auto-generated timestamp and document reference when order document is issued', async () => {
    const authenticatedUserId = 'user-001';
    const customerId = 'cust-555';
    const orderId = 'order-999';
    const issuedAtReferenceTime = new Date('2024-01-15T11:30:00Z');

    const orderDocumentInput = {
      orderId: orderId,
      customerId: customerId,
      customerName: 'Test Corporation',
      customerEmail: 'contact@testcorp.example.com',
      orderItems: [
        {
          productId: 'prod-001',
          productName: 'Service Package A',
          quantity: 1,
          unitPrice: 50000,
        },
      ],
      totalAmount: 50000,
      issuedBy: authenticatedUserId,
    };

    const result = await issueOrderDocument(
      orderDocumentInput,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter
    );

    expect(result.status).toBe('issued');
    expect(result.issueId).toBeDefined();
    expect(typeof result.issueId).toBe('string');
    expect(result.issueId.length).toBeGreaterThan(0);
    expect(result.orderId).toBe(orderId);
    expect(result.documentUrl).toBe('doc-12345');
    expect(result.successMessage).toBe('注文書が正常に発行されました');

    const issuedAtTimestamp = new Date(result.issuedAt).getTime();
    const referenceTimestamp = issuedAtReferenceTime.getTime();
    const timeDiffMs = Math.abs(issuedAtTimestamp - referenceTimestamp);
    expect(timeDiffMs).toBeLessThanOrEqual(5000);

    expect(result.createdBy).toBe(authenticatedUserId);

    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(1);
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: orderId,
        customerId: customerId,
      })
    );

    expect(mockNotificationServiceAdapter.sendOrderNotification).toHaveBeenCalledTimes(1);
    expect(mockNotificationServiceAdapter.sendOrderNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: orderId,
        customerEmail: 'contact@testcorp.example.com',
        documentUrl: 'doc-12345',
      })
    );

    expect(result.issuedAtISOFormat).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    );
  });
});