import { issueQuote } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータルでの商談情報参照機能 - 帳票発行', () => {
  // SCEN-042: [normal] 帳票発行時の発行日時自動付与と発行履歴記録 - 見積書の発行履歴がシステムに1件記録される
  test('見積書発行時に発行日時が自動付与され、発行履歴が正確に記録される', async () => {
    const customerId = 'CUST-001';
    const loggedInUserId = 'USER-A123';
    const sessionId = 'SESSION-XYZ789';
    const documentId = 'DOC-QT-20250126-001';
    const issuanceTimestamp = new Date('2025-01-26T10:30:00Z');

    const quoteData = {
      customerId,
      items: [
        { productId: 'PROD-001', name: 'テスト商品A', quantity: 2, unitPrice: 50000 },
      ],
      totalAmount: 100000,
    };

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId,
        uploadedAt: issuanceTimestamp.toISOString(),
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://drive.example.com/share/DOC-QT-20250126-001',
      }),
      deleteDocument: jest.fn().mockResolvedValue({}),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: 'MSG-001',
        sentAt: issuanceTimestamp.toISOString(),
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({}),
      sendInvoiceNotification: jest.fn().mockResolvedValue({}),
      getDeliveryStatus: jest.fn().mockResolvedValue({}),
    };

    const mockDatabase = {
      insertQuoteIssueHistory: jest.fn().mockResolvedValue({
        id: 'HISTORY-001',
        customerId,
        documentId,
        issuedBy: loggedInUserId,
        issuedAt: issuanceTimestamp.toISOString(),
        status: 'completed',
      }),
      queryQuoteIssueHistoryByCustomerAndUser: jest.fn().mockResolvedValue([
        {
          id: 'HISTORY-001',
          customerId,
          documentId,
          issuedBy: loggedInUserId,
          issuedAt: issuanceTimestamp.toISOString(),
          status: 'completed',
        },
      ]),
    };

    const result = await issueQuote(
      quoteData,
      loggedInUserId,
      sessionId,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockDatabase
    );

    expect(result.success).toBe(true);
    expect(result.documentId).toBe(documentId);
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(1);
    expect(mockNotificationServiceAdapter.sendQuoteNotification).toHaveBeenCalledTimes(1);

    const historyCalls = mockDatabase.queryQuoteIssueHistoryByCustomerAndUser.mock.calls;
    const historyRecords = await mockDatabase.queryQuoteIssueHistoryByCustomerAndUser(
      customerId,
      loggedInUserId
    );

    expect(historyRecords).toHaveLength(1);
    expect(historyRecords[0].customerId).toBe(customerId);
    expect(historyRecords[0].documentId).toBe(documentId);
    expect(historyRecords[0].issuedBy).toBe(loggedInUserId);
    expect(historyRecords[0].status).toBe('completed');

    const recordedTimestamp = new Date(historyRecords[0].issuedAt);
    const timeDiff = Math.abs(recordedTimestamp.getTime() - issuanceTimestamp.getTime());
    expect(timeDiff).toBeLessThanOrEqual(5000);
  });
});