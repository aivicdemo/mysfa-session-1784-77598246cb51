import { generateMonthlyRevenueReport } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-319
  test('月次決算レポート生成機能 - 対象期間の終了日の翌日00:00:00時点のレコードは集計対象から除外される', () => {
    const target_period_start = new Date('2024-01-01T00:00:00Z');
    const target_period_end = new Date('2024-01-31T23:59:59Z');

    const records = [
      {
        id: 'record_a',
        amount: 100000,
        created_at: new Date('2024-01-31T23:59:59Z'),
        status: 'completed',
        customer_id: 'cust_001',
        invoice_amount: 100000,
      },
      {
        id: 'record_b',
        amount: 200000,
        created_at: new Date('2024-02-01T00:00:00Z'),
        status: 'completed',
        customer_id: 'cust_002',
        invoice_amount: 200000,
      },
      {
        id: 'record_c',
        amount: 150000,
        created_at: new Date('2024-02-01T00:00:01Z'),
        status: 'completed',
        customer_id: 'cust_003',
        invoice_amount: 150000,
      },
    ];

    const report = generateMonthlyRevenueReport(
      target_period_start,
      target_period_end,
      records
    );

    expect(report.included_record_count).toBe(1);
    expect(report.excluded_record_count).toBe(2);
    expect(report.total_revenue).toBe(100000);
    expect(report.total_invoice_amount).toBe(100000);
    expect(report.included_records).toEqual([
      {
        id: 'record_a',
        amount: 100000,
        created_at: new Date('2024-01-31T23:59:59Z'),
        status: 'completed',
        customer_id: 'cust_001',
        invoice_amount: 100000,
      },
    ]);
    expect(report.excluded_records).toEqual([
      {
        id: 'record_b',
        amount: 200000,
        created_at: new Date('2024-02-01T00:00:00Z'),
        status: 'completed',
        customer_id: 'cust_002',
        invoice_amount: 200000,
      },
      {
        id: 'record_c',
        amount: 150000,
        created_at: new Date('2024-02-01T00:00:01Z'),
        status: 'completed',
        customer_id: 'cust_003',
        invoice_amount: 150000,
      },
    ]);
  });
});