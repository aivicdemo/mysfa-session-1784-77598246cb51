import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { issueQuoteWithNotification } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 見積書発行時のメール送信失敗処理', () => {
  let mockNotificationServiceAdapter: any;
  let mockDocumentStorageAdapter: any;

  beforeEach(() => {
    mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'doc-12345',
        storageUrl: 'https://storage.example.com/quote-001.pdf',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://share.example.com/quote-001-token',
        expiresAt: new Date('2024-01-15T23:00:00Z').toISOString(),
      }),
      deleteDocument: jest.fn().mockResolvedValue({}),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-160
  test('should display user-friendly error message and queue email task when sendQuoteNotification fails, while quote remains issued', async () => {
    // Arrange: メール送信失敗をシミュレート
    const sendQuoteNotificationError = new Error('Mail API timeout');
    mockNotificationServiceAdapter.sendQuoteNotification.mockRejectedValueOnce(
      sendQuoteNotificationError
    );

    const quoteData = {
      quoteId: 'QUOTE-2024-001',
      customerId: 'CUST-00123',
      customerEmail: 'contact@customer.example.com',
      customerName: 'Example Corporation',
      amount: 150000,
      currency: 'JPY',
      items: [
        {
          productId: 'PROD-A',
          productName: 'Professional License',
          quantity: 2,
          unitPrice: 50000,
          lineTotal: 100000,
        },
        {
          productId: 'PROD-B',
          productName: 'Support Package',
          quantity: 1,
          unitPrice: 50000,
          lineTotal: 50000,
        },
      ],
      validityPeriodDays: 30,
      issuedDate: '2024-01-15T10:00:00Z',
    };

    // Act: 見積発行フロー実行
    const result = await issueQuoteWithNotification(
      quoteData,
      mockNotificationServiceAdapter,
      mockDocumentStorageAdapter
    );

    // Assert: 見積書は正常に発行済み
    expect(result.quoteId).toBe('QUOTE-2024-001');
    expect(result.status).toBe('issued');
    expect(result.issuedDate).toBe('2024-01-15T10:00:00Z');
    expect(result.documentStorageUrl).toBe('https://storage.example.com/quote-001.pdf');

    // Assert: エラーメッセージが利用者向けのメッセージ
    expect(result.userMessage).toMatch(/メール送信に失敗しました/);
    expect(result.userMessage).toMatch(/手動で顧客に連絡してください/);

    // Assert: エラーメッセージ表示は解除可能（systemError フラグで区別可能）
    expect(result.systemError).toBe(true);
    expect(result.dismissible).toBe(true);

    // Assert: メール送信タスクがシステム内部キューに記録
    expect(result.emailQueueTask).toBeDefined();
    expect(result.emailQueueTask.quoteId).toBe('QUOTE-2024-001');
    expect(result.emailQueueTask.recipientEmail).toBe('contact@customer.example.com');
    expect(result.emailQueueTask.notificationType).toBe('quote');
    expect(result.emailQueueTask.status).toBe('queued');
    expect(result.emailQueueTask.retryCount).toBe(0);
    expect(result.emailQueueTask.maxRetries).toBe(5);

    // Assert: ユーザーはポータルを継続利用可能（操作可能フラグ）
    expect(result.portalAccessible).toBe(true);

    // Assert: sendQuoteNotification が呼び出され、エラーが発生したことを確認
    expect(mockNotificationServiceAdapter.sendQuoteNotification).toHaveBeenCalledWith({
      quoteId: 'QUOTE-2024-001',
      customerEmail: 'contact@customer.example.com',
      customerName: 'Example Corporation',
      amount: 150000,
      currency: 'JPY',
      shareLink: 'https://share.example.com/quote-001-token',
    });

    // Assert: ドキュメント保存とシェアリンク生成は成功
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalled();
    expect(mockDocumentStorageAdapter.generateShareLink).toHaveBeenCalled();
  });
});