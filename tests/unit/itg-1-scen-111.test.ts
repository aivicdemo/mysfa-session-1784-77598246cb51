import { extractCustomersAndTransactionsByPeriod } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-111
  test('月次報告期限・データ抽出処理 - 抽出対象期間の翌月に作成された顧客レコードが抽出対象に含まれない', () => {
    const monthly_report_deadline = new Date('2024-01-31T23:59:59Z');
    const extraction_start_date = new Date('2024-01-01T00:00:00Z');
    const extraction_end_date = new Date('2024-01-31T23:59:59Z');

    const customer_record_a = {
      customer_id: 'CUST-001',
      customer_name: 'Customer A Corp',
      created_at: new Date('2024-01-15T10:30:00Z'),
    };

    const customer_record_b = {
      customer_id: 'CUST-002',
      customer_name: 'Customer B Corp',
      created_at: new Date('2024-02-05T14:20:00Z'),
    };

    const all_customer_records = [customer_record_a, customer_record_b];

    const extraction_result = extractCustomersAndTransactionsByPeriod(
      all_customer_records,
      extraction_start_date,
      extraction_end_date,
    );

    const extracted_customer_ids = extraction_result.map(
      (customer) => customer.customer_id,
    );

    expect(extracted_customer_ids).toEqual(['CUST-001']);
    expect(extracted_customer_ids).not.toContain('CUST-002');
    expect(extraction_result).toHaveLength(1);
    expect(extraction_result[0].customer_id).toBe('CUST-001');
    expect(extraction_result[0].customer_name).toBe('Customer A Corp');
  });
});