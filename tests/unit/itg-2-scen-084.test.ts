import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { issueQuote } from '../../src/logic/it-1784969823049-2-1-2';

// Mock types for adapters
interface DocumentStorageAdapterStub {
  uploadDocument: jest.Mock;
}

interface NotificationServiceAdapterStub {
  sendQuoteNotification: jest.Mock;
}

interface QuoteIssuanceRecord {
  customerId: string;
  quoteId: string;
  issuedAt: string;
  status: string;
}

interface MockAuditDatabase {
  quoteIssuanceHistory: QuoteIssuanceRecord[];
}

describe('顧客向け専用ポータルでの商談情報参照機能 - 帳票発行', () => {
  let documentStorageAdapter: DocumentStorageAdapterStub;
  let notificationServiceAdapter: NotificationServiceAdapterStub;
  let mockDatabase: MockAuditDatabase;
  const fixedNow = new Date('2024-01-15T11:00:00Z');

  beforeEach(() => {
    documentStorageAdapter = {
      uploadDocument: jest.fn(),
    };

    notificationServiceAdapter = {
      sendQuoteNotification: jest.fn(),
    };

    mockDatabase = {
      quoteIssuanceHistory: [],
    };

    // Mock adapter responses
    documentStorageAdapter.uploadDocument.mockResolvedValue({
      documentId: 'DOC-20240115-QT-001',
      fileUrl: 'https://storage.example.com/quotes/QT-20240115-001.pdf',
      uploadedAt: fixedNow.toISOString(),
    });

    notificationServiceAdapter.sendQuoteNotification.mockResolvedValue({
      messageId: 'MSG-20240115-001',
      deliveryStatus: 'sent',
      sentAt: fixedNow.toISOString(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-084
  test('帳票発行時の発行日時自動付与と発行履歴記録 - 見積書の発行履歴に顧客IDが正確に記録される', async () => {
    const customerId = 'CUST-20240115-001';
    const quoteDetails = {
      customerId: customerId,
      productSelections: [
        { productId: 'PROD-001', quantity: 2, unitPrice: 50000 },
        { productId: 'PROD-002', quantity: 1, unitPrice: 30000 },
      ],
      totalAmount: 130000,
    };

    // Execute quote issuance
    const result = await issueQuote(
      quoteDetails,
      documentStorageAdapter,
      notificationServiceAdapter,
      {
        recordIssuance: (record: QuoteIssuanceRecord) => {
          mockDatabase.quoteIssuanceHistory.push(record);
        },
        getCurrentTime: () => fixedNow,
      }
    );

    // Verify document upload was called
    expect(documentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(1);
    expect(documentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        documentType: 'quote',
        customerId: customerId,
      })
    );

    // Verify notification was sent
    expect(notificationServiceAdapter.sendQuoteNotification).toHaveBeenCalledTimes(
      1
    );
    expect(notificationServiceAdapter.sendQuoteNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: customerId,
        quoteId: expect.stringMatching(/^QT-/),
      })
    );

    // Verify issuance history record exists in database
    expect(mockDatabase.quoteIssuanceHistory).toHaveLength(1);

    const issuanceRecord = mockDatabase.quoteIssuanceHistory[0];

    // Assert customer ID is recorded correctly
    expect(issuanceRecord.customerId).toBe('CUST-20240115-001');

    // Assert quote ID is assigned and matches the result
    expect(issuanceRecord.quoteId).toBe(result.quoteId);
    expect(issuanceRecord.quoteId).toMatch(/^QT-\d+/);

    // Assert issued timestamp matches system time (within ±5 seconds tolerance)
    const issuedTime = new Date(issuanceRecord.issuedAt).getTime();
    const expectedTime = fixedNow.getTime();
    const timeDifference = Math.abs(issuedTime - expectedTime);
    expect(timeDifference).toBeLessThanOrEqual(5000);

    // Assert status is recorded as issued
    expect(issuanceRecord.status).toBe('発行済み');
  });
});