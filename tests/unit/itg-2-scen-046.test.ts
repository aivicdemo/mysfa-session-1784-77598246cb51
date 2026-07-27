import { issuanceRecordsWithinSameSecond } from '../../src/logic/it-1784969823049-2-1-2';

describe('帳票発行・履歴管理機能 - 同一秒内複数帳票発行時の個別記録', () => {
  // SCEN-046
  test('同一秒内に複数帳票が発行されたとき、それぞれが異なる発行履歴として記録される', async () => {
    const current_timestamp = new Date('2024-01-15T11:00:00.000Z');
    const issuer_user_id = 'user_001';
    const issuer_name = 'Taro Yamada';

    const issuance_requests = [
      {
        document_id: 'quote_001',
        document_type: 'quote',
        customer_id: 'cust_101',
        customer_name: 'ABC Corporation',
        issued_at: current_timestamp,
        issued_by_user_id: issuer_user_id,
        issued_by_name: issuer_name,
        amount: 100000,
      },
      {
        document_id: 'order_001',
        document_type: 'order',
        customer_id: 'cust_101',
        customer_name: 'ABC Corporation',
        issued_at: current_timestamp,
        issued_by_user_id: issuer_user_id,
        issued_by_name: issuer_name,
        amount: 100000,
      },
      {
        document_id: 'invoice_001',
        document_type: 'invoice',
        customer_id: 'cust_101',
        customer_name: 'ABC Corporation',
        issued_at: current_timestamp,
        issued_by_user_id: issuer_user_id,
        issued_by_name: issuer_name,
        amount: 100000,
      },
    ];

    const result = await issuanceRecordsWithinSameSecond(issuance_requests);

    expect(result.issuance_records).toHaveLength(3);

    expect(result.issuance_records[0]).toMatchObject({
      issuance_history_id: expect.any(String),
      document_id: 'quote_001',
      document_type: 'quote',
      customer_id: 'cust_101',
      customer_name: 'ABC Corporation',
      issued_by_user_id: issuer_user_id,
      issued_by_name: issuer_name,
    });

    expect(result.issuance_records[1]).toMatchObject({
      issuance_history_id: expect.any(String),
      document_id: 'order_001',
      document_type: 'order',
      customer_id: 'cust_101',
      customer_name: 'ABC Corporation',
      issued_by_user_id: issuer_user_id,
      issued_by_name: issuer_name,
    });

    expect(result.issuance_records[2]).toMatchObject({
      issuance_history_id: expect.any(String),
      document_id: 'invoice_001',
      document_type: 'invoice',
      customer_id: 'cust_101',
      customer_name: 'ABC Corporation',
      issued_by_user_id: issuer_user_id,
      issued_by_name: issuer_name,
    });

    const history_ids = result.issuance_records.map(
      (record) => record.issuance_history_id
    );
    const unique_history_ids = new Set(history_ids);
    expect(unique_history_ids.size).toBe(3);

    expect(result.issuance_records[0].issuance_timestamp_microseconds).toBeDefined();
    expect(result.issuance_records[1].issuance_timestamp_microseconds).toBeDefined();
    expect(result.issuance_records[2].issuance_timestamp_microseconds).toBeDefined();

    const microsecond_timestamps = result.issuance_records.map(
      (record) => record.issuance_timestamp_microseconds
    );
    const unique_timestamps = new Set(microsecond_timestamps);
    expect(unique_timestamps.size).toBe(3);

    expect(result.issuance_records[0].sequence_number).toBe(1);
    expect(result.issuance_records[1].sequence_number).toBe(2);
    expect(result.issuance_records[2].sequence_number).toBe(3);

    result.issuance_records.forEach((record) => {
      expect(record.issued_date_second).toBe('2024-01-15T11:00:00Z');
    });

    expect(result.total_issuance_count).toBe(3);
    expect(result.duplicate_records_detected).toBe(false);
  });
});