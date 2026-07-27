import { sendQuoteNotificationWithFallback } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-1006
  test('Google Workspace メール API連携 - メール送信が失敗した場合、ユーザーに「メール送信に失敗しました」と表示され、代替動作として送信キューに保存される', async () => {
    // Setup: メール送信失敗を模擬するスタブ
    const failingNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockRejectedValue(
        new Error('API timeout: Workspace メール送信に失敗')
      ),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    // Setup: メール送信キューへの保存を行うモック
    const mockMailQueueRepository = {
      create: jest.fn().mockResolvedValue({
        id: 'queue-001',
        quote_id: 'quote-12345',
        recipient_email: 'test@example.com',
        notification_type: 'QUOTE',
        status: 'QUEUED',
        created_at: new Date('2024-01-15T11:00:00Z'),
        retry_count: 0,
      }),
    };

    // Input: 有効な顧客メールアドレスを持つ見積書データ
    const quoteData = {
      id: 'quote-12345',
      customer_id: 'cust-001',
      customer_name: 'Test Customer',
      recipient_email: 'test@example.com',
      quote_amount: 100000,
      quote_date: new Date('2024-01-15T10:00:00Z'),
      expiry_date: new Date('2024-02-15T10:00:00Z'),
      status: 'PENDING',
      line_items: [
        {
          product_id: 'prod-001',
          product_name: 'Product A',
          quantity: 1,
          unit_price: 100000,
        },
      ],
    };

    // Execute: メール送信を試行
    const result = await sendQuoteNotificationWithFallback(
      quoteData,
      failingNotificationServiceAdapter,
      mockMailQueueRepository
    );

    // Assert: (1) ユーザー画面用エラーメッセージが返される
    expect(result.userMessage).toBe('メール送信に失敗しました。手動で顧客に連絡してください');

    // Assert: (2) 見積書ステータスは変わらず
    expect(result.quote_status).toBe('PENDING');

    // Assert: (3) メール送信キューに1件のレコードが作成される
    expect(mockMailQueueRepository.create).toHaveBeenCalledTimes(1);
    const queueCallArg = mockMailQueueRepository.create.mock.calls[0][0];
    expect(queueCallArg.quote_id).toBe('quote-12345');
    expect(queueCallArg.recipient_email).toBe('test@example.com');
    expect(queueCallArg.notification_type).toBe('QUOTE');
    expect(queueCallArg.status).toBe('QUEUED');
    expect(queueCallArg.retry_count).toBe(0);

    // Assert: (4) キューレコードが表示可能状態で保存されている
    const createdQueueRecord = await mockMailQueueRepository.create(queueCallArg);
    expect(createdQueueRecord).toEqual(
      expect.objectContaining({
        id: 'queue-001',
        quote_id: 'quote-12345',
        recipient_email: 'test@example.com',
        notification_type: 'QUOTE',
        status: 'QUEUED',
        retry_count: 0,
      })
    );

    // Assert: NotificationServiceAdapterが呼び出されたことを確認
    expect(failingNotificationServiceAdapter.sendQuoteNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        recipient_email: 'test@example.com',
        quote_id: 'quote-12345',
      })
    );
  });
});