import { issueQuoteWithFutureDateTime } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 商談情報参照機能', () => {
  // SCEN-063: [normal] 帳票発行時の発行日時自動付与と発行履歴記録 - 見積書の発行日時が未来の日時のとき、その日時が記録される
  test('should record future issue datetime in quote issue history when issuing quote with future datetime', async () => {
    const current_date_time = new Date('2024-01-15T10:00:00Z');
    const future_issue_date_time = new Date('2024-01-15T15:30:00Z');
    const customer_id = 'cust_12345';
    const customer_name = 'Example Corporation';
    const product_name = 'Enterprise License';
    const amount = 150000;
    const quote_id = 'quote_98765';

    const mock_document_storage_adapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        document_id: 'doc_54321',
        storage_url: 'https://storage.example.com/docs/doc_54321.pdf',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        share_link: 'https://drive.example.com/share/abc123',
        expiry_date: new Date('2024-01-22T15:30:00Z'),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const mock_notification_service_adapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        notification_id: 'notif_11111',
        delivery_status: 'sent',
        sent_at: future_issue_date_time,
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({}),
      sendInvoiceNotification: jest.fn().mockResolvedValue({}),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: 'delivered',
        opened_at: null,
      }),
    };

    const quote_input = {
      customer_id,
      customer_name,
      product_name,
      amount,
      issue_date_time: future_issue_date_time,
      current_date_time,
    };

    const result = await issueQuoteWithFutureDateTime(
      quote_input,
      mock_document_storage_adapter,
      mock_notification_service_adapter,
    );

    expect(result).toEqual({
      quote_id: expect.any(String),
      issue_date_time: future_issue_date_time,
      storage_url: 'https://storage.example.com/docs/doc_54321.pdf',
      notification_id: 'notif_11111',
      delivery_status: 'sent',
    });

    expect(result.issue_date_time).toEqual(future_issue_date_time);
    expect(result.issue_date_time.toISOString()).toBe('2024-01-15T15:30:00.000Z');

    expect(mock_document_storage_adapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_id,
        customer_name,
        product_name,
        amount,
      }),
    );

    expect(mock_notification_service_adapter.sendQuoteNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_id,
        quote_id: expect.any(String),
      }),
    );
  });
});