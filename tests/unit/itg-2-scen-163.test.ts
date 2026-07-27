import { issueQuoteWithNotification } from '../../src/logic/it-1784969823049-2-1-2';

describe('Google Workspace メール API連携 - メール送信失敗時のキューイング', () => {
  // SCEN-163
  test('メール送信が失敗した場合、送信内容はシステム内部のメール送信キューに保存される', async () => {
    const quoteId = 'QUOTE-20240115-001';
    const customerId = 'CUST-001';
    const customerEmail = 'customer@example.com';
    const quoteAmount = 150000;
    const quoteSubject = '見積書のご送付';
    const quoteBody = '別紙の通り、見積書をお送りさせていただきます。';
    const failureTimestamp = new Date('2024-01-15T10:30:00Z');
    const initialRetryCount = 0;

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockRejectedValueOnce(
        new Error('API_TIMEOUT')
      ),
      getDeliveryStatus: jest.fn(),
    };

    const mockEmailQueueRepository = {
      saveToQueue: jest.fn().mockResolvedValueOnce({
        id: 'QUEUE-001',
        recipientEmail: customerEmail,
        subject: quoteSubject,
        body: quoteBody,
        relatedDocumentId: quoteId,
        status: 'pending',
        initialFailureTime: failureTimestamp,
        retryCount: initialRetryCount,
      }),
      findById: jest.fn(),
    };

    const result = await issueQuoteWithNotification(
      {
        quoteId,
        customerId,
        customerEmail,
        amount: quoteAmount,
      },
      mockNotificationServiceAdapter,
      mockEmailQueueRepository
    );

    expect(mockNotificationServiceAdapter.sendQuoteNotification).toHaveBeenCalledWith({
      quoteId,
      customerEmail,
      subject: quoteSubject,
      body: quoteBody,
    });

    expect(mockEmailQueueRepository.saveToQueue).toHaveBeenCalledWith({
      recipientEmail: customerEmail,
      subject: quoteSubject,
      body: quoteBody,
      relatedDocumentId: quoteId,
      status: 'pending',
      initialFailureTime: expect.any(Date),
      retryCount: 0,
    });

    expect(result).toEqual({
      success: false,
      quoteId,
      messageKey: 'メール送信に失敗しました。手動で顧客に連絡してください',
      queuedForRetry: true,
      queueId: 'QUEUE-001',
    });
  });
});