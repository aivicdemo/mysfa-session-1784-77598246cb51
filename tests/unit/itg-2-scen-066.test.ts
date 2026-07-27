import { issueQuote } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向け専用ポータルでの商談情報参照機能', () => {
  // SCEN-066
  test('[edge] 帳票発行時の発行日時自動付与と発行履歴記録 - 見積書の発行日時が月末のとき、その日時が正確に記録される', () => {
    const fixed_issue_datetime = new Date('2024-01-31T23:59:59Z');
    const fixed_customer_id = 'CUST-001';
    const fixed_customer_email = 'customer@example.com';
    const fixed_quote_id = 'QUOTE-001';
    const fixed_quote_amount = 100000;

    let captured_storage_metadata: any = null;
    let captured_notification_body: any = null;

    const mock_document_storage_adapter = {
      uploadDocument: jest.fn((doc_content: string, metadata: any) => {
        captured_storage_metadata = metadata;
        return Promise.resolve({ document_id: 'DOC-001', url: 'https://storage.example.com/doc-001' });
      }),
      generateShareLink: jest.fn(() => Promise.resolve({ share_link: 'https://storage.example.com/share/abc123' })),
      deleteDocument: jest.fn(() => Promise.resolve({ success: true })),
    };

    const mock_notification_service_adapter = {
      sendQuoteNotification: jest.fn((customer_email: string, notification_data: any) => {
        captured_notification_body = notification_data;
        return Promise.resolve({ message_id: 'MSG-001', status: 'sent' });
      }),
      sendOrderNotification: jest.fn(() => Promise.resolve({ message_id: 'MSG-002', status: 'sent' })),
      sendInvoiceNotification: jest.fn(() => Promise.resolve({ message_id: 'MSG-003', status: 'sent' })),
      getDeliveryStatus: jest.fn(() => Promise.resolve({ status: 'delivered' })),
    };

    const quote_input = {
      customer_id: fixed_customer_id,
      customer_email: fixed_customer_email,
      quote_id: fixed_quote_id,
      quote_amount: fixed_quote_amount,
      quote_items: [
        { item_id: 'ITEM-001', description: 'Product A', quantity: 1, unit_price: 100000 }
      ],
      current_datetime: fixed_issue_datetime,
    };

    return issueQuote(
      quote_input,
      mock_document_storage_adapter,
      mock_notification_service_adapter
    ).then((result: any) => {
      expect(result.issued_quote_id).toBe(fixed_quote_id);
      expect(result.issued_datetime).toEqual(fixed_issue_datetime);
      expect(result.issued_datetime.toISOString()).toBe('2024-01-31T23:59:59.000Z');

      expect(mock_document_storage_adapter.uploadDocument).toHaveBeenCalled();
      expect(captured_storage_metadata).toBeDefined();
      expect(captured_storage_metadata.issued_datetime).toEqual(fixed_issue_datetime);
      expect(captured_storage_metadata.issued_datetime.toISOString()).toBe('2024-01-31T23:59:59.000Z');

      expect(mock_notification_service_adapter.sendQuoteNotification).toHaveBeenCalledWith(
        fixed_customer_email,
        expect.objectContaining({
          issued_datetime: fixed_issue_datetime,
        })
      );
      expect(captured_notification_body).toBeDefined();
      expect(captured_notification_body.issued_datetime).toEqual(fixed_issue_datetime);
      expect(captured_notification_body.issued_datetime.toISOString()).toBe('2024-01-31T23:59:59.000Z');

      const issued_date_string = captured_notification_body.issued_datetime_formatted || 
        captured_notification_body.issued_datetime.toISOString();
      expect(issued_date_string).toContain('2024-01-31');
      expect(issued_date_string).not.toContain('2024-02-01');
    });
  });
});