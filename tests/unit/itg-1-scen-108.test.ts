import { extractCustomerRecordsByPeriod } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-108: [edge] 月次報告期限・データ抽出処理 - 抽出対象期間の開始日に作成された顧客レコードが抽出対象に含まれる
  test('抽出対象期間の開始日境界値に該当する顧客レコードが正常に抽出対象に含まれる', () => {
    const extraction_period_start = new Date('2024-01-01T00:00:00Z');
    const extraction_period_end = new Date('2024-01-31T23:59:59Z');

    const customer_records = [
      {
        customer_id: 'CUST-001',
        customer_name: 'テスト顧客A',
        created_at: new Date('2024-01-01T00:00:00Z'),
      },
      {
        customer_id: 'CUST-002',
        customer_name: 'テスト顧客B',
        created_at: new Date('2023-12-31T23:59:59Z'),
      },
      {
        customer_id: 'CUST-003',
        customer_name: 'テスト顧客C',
        created_at: new Date('2024-01-02T10:00:00Z'),
      },
    ];

    const extracted_records = extractCustomerRecordsByPeriod(
      customer_records,
      extraction_period_start,
      extraction_period_end
    );

    expect(extracted_records).toHaveLength(2);
    expect(extracted_records[0]).toEqual({
      customer_id: 'CUST-001',
      customer_name: 'テスト顧客A',
      created_at: new Date('2024-01-01T00:00:00Z'),
    });
    expect(extracted_records[1]).toEqual({
      customer_id: 'CUST-003',
      customer_name: 'テスト顧客C',
      created_at: new Date('2024-01-02T10:00:00Z'),
    });
    expect(
      extracted_records.some((record) => record.customer_id === 'CUST-002')
    ).toBe(false);
  });
});