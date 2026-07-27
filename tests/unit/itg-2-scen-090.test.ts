import { issuedDocumentWithZeroAmount } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータルでの帳票発行機能 - 金額0円の帳票発行履歴記録', () => {
  // SCEN-090: [edge] 帳票発行時の発行日時自動付与と発行履歴記録 - 帳票の金額が0のときも発行履歴が記録される
  test('金額が0円の帳票であっても発行日時が自動付与され発行履歴に記録される', async () => {
    const customer_id = 'CUST-12345';
    const document_type = 'quote';
    const amount = 0;
    const fixed_issue_timestamp = new Date('2024-01-15T14:30:00Z');
    const expected_status = 'issued';

    const document_storage_stub = {
      uploadDocument: jest.fn().mockResolvedValue({
        document_id: 'DOC-67890',
        storage_url: 'https://storage.example.com/doc-67890.pdf',
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const notification_service_stub = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        email_id: 'EMAIL-001',
        delivery_status: 'sent',
      }),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const issued_history_repository_stub = {
      save: jest.fn().mockResolvedValue({
        history_id: 'HIST-99999',
        customer_id,
        document_type,
        issue_timestamp: fixed_issue_timestamp.toISOString(),
        amount,
        status: expected_status,
      }),
      findByCustomerId: jest.fn().mockResolvedValue([
        {
          history_id: 'HIST-99999',
          customer_id,
          document_type,
          issue_timestamp: fixed_issue_timestamp.toISOString(),
          amount,
          status: expected_status,
        },
      ]),
    };

    const result = await issuedDocumentWithZeroAmount(
      {
        customer_id,
        document_type,
        amount,
        document_name: 'Zero Amount Quote',
      },
      document_storage_stub,
      notification_service_stub,
      issued_history_repository_stub,
      fixed_issue_timestamp
    );

    expect(result).toEqual({
      history_id: 'HIST-99999',
      customer_id,
      document_type,
      issue_timestamp: fixed_issue_timestamp.toISOString(),
      amount,
      status: expected_status,
    });

    expect(document_storage_stub.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_id,
        document_type,
        amount: 0,
      })
    );

    expect(notification_service_stub.sendQuoteNotification).toHaveBeenCalled();

    expect(issued_history_repository_stub.save).toHaveBeenCalledWith({
      customer_id,
      document_type,
      issue_timestamp: fixed_issue_timestamp.toISOString(),
      amount: 0,
      status: expected_status,
    });

    const retrieved_history = await issued_history_repository_stub.findByCustomerId(customer_id);
    expect(retrieved_history).toHaveLength(1);
    expect(retrieved_history[0]).toEqual({
      history_id: 'HIST-99999',
      customer_id,
      document_type,
      issue_timestamp: fixed_issue_timestamp.toISOString(),
      amount: 0,
      status: expected_status,
    });
  });
});