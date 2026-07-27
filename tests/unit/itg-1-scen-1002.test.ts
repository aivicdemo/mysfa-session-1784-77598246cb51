import { sendQuoteNotification } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-1002
  test('Google Workspace メール API連携 - sendQuoteNotificationが成功応答を受けた場合、顧客へ見積書発行通知が送信される', async () => {
    // 前提条件: 見積書情報と顧客メールアドレスの準備
    const customer_email = 'customer@example.com';
    const quote_id = 'QT-2024-001';
    const quote_amount = 150000;
    const quote_items = [
      { item_name: 'ソフトウェアライセンス', quantity: 1, unit_price: 100000 },
      { item_name: 'サポートサービス', quantity: 1, unit_price: 50000 }
    ];
    const quote_valid_until = '2024-03-15T23:59:59Z';

    // NotificationServiceAdapterのsendQuoteNotificationメソッドをモック化
    const mock_message_id = 'MSG-20240115-001';
    const mock_notification_adapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        status: 'success',
        message_id: mock_message_id,
        recipient_email: customer_email,
        sent_at: '2024-01-15T11:00:00Z'
      })
    };

    // sendQuoteNotificationメソッドを呼び出し
    const result = await sendQuoteNotification(
      {
        quote_id: quote_id,
        customer_email: customer_email,
        quote_amount: quote_amount,
        quote_items: quote_items,
        quote_valid_until: quote_valid_until
      },
      mock_notification_adapter
    );

    // (1) メソッドの戻り値がsuccess状態を示すことを検証
    expect(result.status).toBe('success');
    expect(result.message_id).toBe(mock_message_id);

    // (2) NotificationServiceAdapterに対して顧客メールアドレスと見積書情報を含む呼び出しが1回実行されたことを検証
    expect(mock_notification_adapter.sendQuoteNotification).toHaveBeenCalledTimes(1);
    expect(mock_notification_adapter.sendQuoteNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        recipient_email: customer_email,
        quote_id: quote_id,
        quote_amount: quote_amount
      })
    );

    // (3) システム内の通知ログに『見積書発行通知を顧客customer@example.comへ送信完了』というイベントが記録されていることを検証
    expect(result.notification_log).toBeDefined();
    expect(result.notification_log).toEqual(
      expect.objectContaining({
        event_type: 'QUOTE_NOTIFICATION_SENT',
        recipient_email: customer_email,
        quote_id: quote_id,
        status: 'success'
      })
    );

    // (4) 顧客へのメール送信が完了状態に遷移し、以降の再試行処理は実行されないことを検証
    expect(result.retry_count).toBe(0);
    expect(result.is_final_state).toBe(true);
  });
});