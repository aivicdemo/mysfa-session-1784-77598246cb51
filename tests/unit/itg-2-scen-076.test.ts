import { issueOrderDocument } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向け専用ポータルでの商談情報参照機能', () => {
  // SCEN-076: [normal] 帳票発行時の発行日時自動付与と発行履歴記録 - 同じ注文書を複数回発行したとき、各発行履歴の発行日時が異なる
  test('should record distinct issue timestamps for multiple order document issuances', async () => {
    const order_id = 'ORD-20240115-001';
    const customer_id = 'CUST-00001';
    const user_id = 'USER-00001';

    const first_issue_timestamp = new Date('2024-01-15T09:30:45.123Z');
    const second_issue_timestamp = new Date('2024-01-15T09:35:22.456Z');
    const third_issue_timestamp = new Date('2024-01-15T09:42:10.789Z');

    const mock_document_storage = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const assumed_upload_response_first = {
      document_id: 'DOC-001',
      file_url: 'https://drive.example.com/file/DOC-001',
      uploaded_at: first_issue_timestamp.toISOString(),
    };

    const assumed_upload_response_second = {
      document_id: 'DOC-002',
      file_url: 'https://drive.example.com/file/DOC-002',
      uploaded_at: second_issue_timestamp.toISOString(),
    };

    const assumed_upload_response_third = {
      document_id: 'DOC-003',
      file_url: 'https://drive.example.com/file/DOC-003',
      uploaded_at: third_issue_timestamp.toISOString(),
    };

    mock_document_storage.uploadDocument
      .mockResolvedValueOnce(assumed_upload_response_first)
      .mockResolvedValueOnce(assumed_upload_response_second)
      .mockResolvedValueOnce(assumed_upload_response_third);

    const issue_history_first = await issueOrderDocument(
      {
        order_id,
        customer_id,
        user_id,
        document_type: 'ORDER',
        issued_at: first_issue_timestamp,
      },
      mock_document_storage
    );

    const issue_history_second = await issueOrderDocument(
      {
        order_id,
        customer_id,
        user_id,
        document_type: 'ORDER',
        issued_at: second_issue_timestamp,
      },
      mock_document_storage
    );

    const issue_history_third = await issueOrderDocument(
      {
        order_id,
        customer_id,
        user_id,
        document_type: 'ORDER',
        issued_at: third_issue_timestamp,
      },
      mock_document_storage
    );

    expect(issue_history_first.issued_at).toEqual(first_issue_timestamp);
    expect(issue_history_second.issued_at).toEqual(second_issue_timestamp);
    expect(issue_history_third.issued_at).toEqual(third_issue_timestamp);

    expect(issue_history_first.issued_at.getTime()).toBeLessThan(
      issue_history_second.issued_at.getTime()
    );
    expect(issue_history_second.issued_at.getTime()).toBeLessThan(
      issue_history_third.issued_at.getTime()
    );

    expect(mock_document_storage.uploadDocument).toHaveBeenCalledTimes(3);

    const all_issue_records = [
      issue_history_first,
      issue_history_second,
      issue_history_third,
    ];

    expect(all_issue_records.length).toBe(3);
    expect(all_issue_records[0].issued_at.toISOString()).toBe(
      '2024-01-15T09:30:45.123Z'
    );
    expect(all_issue_records[1].issued_at.toISOString()).toBe(
      '2024-01-15T09:35:22.456Z'
    );
    expect(all_issue_records[2].issued_at.toISOString()).toBe(
      '2024-01-15T09:42:10.789Z'
    );
  });
});