import { extractBillingTargetData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  test('SCEN-771: 請求対象データ抽出機能 - 期間条件が開始日ちょうどのとき、該当データが抽出される', () => {
    const start_date = new Date('2024-01-01T00:00:00Z');
    const end_date = new Date('2024-12-31T23:59:59Z');

    const test_records = [
      {
        id: 'record_a',
        billing_date: new Date('2024-01-01T00:00:00Z'),
        amount: 10000,
        status: '未請求'
      },
      {
        id: 'record_b',
        billing_date: new Date('2024-01-02T00:00:00Z'),
        amount: 5000,
        status: '未請求'
      },
      {
        id: 'record_c',
        billing_date: new Date('2023-12-31T00:00:00Z'),
        amount: 3000,
        status: '未請求'
      }
    ];

    const extraction_result = extractBillingTargetData({
      records: test_records,
      start_date: start_date,
      end_date: end_date
    });

    expect(extraction_result.extracted_records).toHaveLength(2);
    expect(extraction_result.total_amount).toBe(15000);
    expect(extraction_result.extracted_records).toContainEqual(
      expect.objectContaining({
        id: 'record_a',
        billing_date: new Date('2024-01-01T00:00:00Z'),
        amount: 10000,
        status: '未請求'
      })
    );
    expect(extraction_result.extracted_records).toContainEqual(
      expect.objectContaining({
        id: 'record_b',
        billing_date: new Date('2024-01-02T00:00:00Z'),
        amount: 5000,
        status: '未請求'
      })
    );
    expect(extraction_result.extracted_records).not.toContainEqual(
      expect.objectContaining({
        id: 'record_c'
      })
    );
  });
});