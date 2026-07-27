import { jest } from '@jest/globals';
import { issueQuote } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 商談情報参照機能', () => {
  // SCEN-039: [normal] 帳票発行時の発行日時自動付与と発行履歴記録 - 見積書を発行したとき、発行日時がシステム現在時刻で自動付与される
  test('見積書発行時に発行日時が自動付与され、発行履歴が記録される', async () => {
    const fixed_issue_datetime = new Date('2024-01-15T14:30:45Z');
    const fixed_valid_until_date = new Date('2024-02-15T00:00:00Z');

    // モックシステム時刻を設定
    jest.useFakeTimers();
    jest.setSystemTime(fixed_issue_datetime);

    // DocumentStorageAdapterのモック
    const mock_document_storage_adapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        document_id: 'doc-quote-20240115-001',
        storage_path: 'gs://customer-portal-storage/quotes/2024-01-15/quote-001.pdf',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        share_link: 'https://drive.google.com/file/d/XXXX/view?usp=sharing',
        expiration_datetime: new Date('2024-01-22T14:30:45Z').toISOString(),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // NotificationServiceAdapterのモック
    const mock_notification_service_adapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        notification_id: 'notif-quote-20240115-001',
        delivery_status: 'sent',
        sent_datetime: new Date('2024-01-15T14:30:50Z').toISOString(),
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({}),
      sendInvoiceNotification: jest.fn().mockResolvedValue({}),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        delivery_status: 'delivered',
        opened_count: 1,
      }),
    };

    // IdentityProviderAdapterのモック（ログイン済み状態を再現）
    const mock_identity_provider_adapter = {
      authenticateUser: jest.fn().mockResolvedValue({
        user_id: 'user-customer-001',
        session_token: 'session-token-abc123xyz',
        token_expiry: new Date('2024-01-15T15:30:45Z').toISOString(),
      }),
      validateToken: jest.fn().mockResolvedValue({
        is_valid: true,
        user_id: 'user-customer-001',
      }),
      refreshToken: jest.fn().mockResolvedValue({
        session_token: 'session-token-refreshed',
      }),
      revokeSession: jest.fn().mockResolvedValue({ success: true }),
    };

    // 見積書発行入力データ
    const quote_issue_input = {
      customer_name: 'テスト太郎',
      amount_jpy: 100000,
      valid_until_date: fixed_valid_until_date.toISOString().split('T')[0],
      customer_email: 'test-taro@example.com',
      customer_id: 'cust-001',
      salesperson_id: 'user-customer-001',
      quote_details: [
        {
          product_name: 'コンサルティング',
          quantity: 1,
          unit_price_jpy: 100000,
        },
      ],
    };

    // データベースモック（帳票発行履歴を格納）
    const mock_document_issue_history: Array<{
      document_type: string;
      customer_name: string;
      issue_datetime: string;
      status: string;
      document_id: string;
    }> = [];

    const mock_db_insert_document_history = jest
      .fn()
      .mockImplementation((record) => {
        mock_document_issue_history.push(record);
        return Promise.resolve({ inserted_id: `record-${mock_document_issue_history.length}` });
      });

    // 見積書発行ロジック実行
    const result = await issueQuote(
      quote_issue_input,
      mock_document_storage_adapter,
      mock_notification_service_adapter,
      mock_identity_provider_adapter,
      mock_db_insert_document_history,
    );

    // 発行履歴テーブルに1件新規レコードが追加されたことを確認
    expect(mock_document_issue_history.length).toBe(1);

    // 発行履歴レコードの内容を検証
    const issued_history_record = mock_document_issue_history[0];
    expect(issued_history_record.document_type).toBe('見積書');
    expect(issued_history_record.customer_name).toBe('テスト太郎');
    expect(issued_history_record.issue_datetime).toBe('2024-01-15T14:30:45Z');
    expect(issued_history_record.status).toBe('発行済み');

    // 見積書発行APIレスポンスが返されたことを確認
    expect(result).toHaveProperty('quote_id');
    expect(result).toHaveProperty('issue_datetime');
    expect(result.issue_datetime).toBe('2024-01-15T14:30:45Z');

    // 見積書プレビューに表示される発行日時を確認
    expect(result).toHaveProperty('preview_display_datetime');
    expect(result.preview_display_datetime).toBe('2024年1月15日 14時30分45秒');

    // DocumentStorageAdapterが正しく呼ばれたことを確認
    expect(mock_document_storage_adapter.uploadDocument).toHaveBeenCalled();
    const upload_call_args = mock_document_storage_adapter.uploadDocument.mock.calls[0];
    expect(upload_call_args[0]).toHaveProperty('issue_datetime');
    expect(upload_call_args[0].issue_datetime).toBe('2024-01-15T14:30:45Z');

    // NotificationServiceAdapterが顧客へのメール送信をトリガーしたことを確認
    expect(mock_notification_service_adapter.sendQuoteNotification).toHaveBeenCalled();
    const notification_call_args =
      mock_notification_service_adapter.sendQuoteNotification.mock.calls[0];
    expect(notification_call_args[0]).toHaveProperty('customer_email');
    expect(notification_call_args[0].customer_email).toBe('test-taro@example.com');

    // データベース書き込みが実行されたことを確認
    expect(mock_db_insert_document_history).toHaveBeenCalled();

    // フェイクタイマーのクリーンアップ
    jest.useRealTimers();
  });
});