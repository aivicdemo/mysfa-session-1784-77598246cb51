import { generateMonthlyRevenueReport } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  test('SCEN-316: [edge] 月次決算レポート生成機能 - 対象期間の開始日00:00:00時点のレコードが集計対象に含まれる', () => {
    const period_start = new Date('2024-01-01T00:00:00Z');
    const period_end = new Date('2024-01-31T23:59:59Z');

    const revenue_records = [
      {
        id: 'rev_001',
        created_at: new Date('2024-01-01T00:00:00Z'),
        amount: 100000,
        product_name: '商品A',
        status: 'completed',
      },
      {
        id: 'rev_002',
        created_at: new Date('2023-12-31T23:59:59Z'),
        amount: 50000,
        product_name: '商品B',
        status: 'completed',
      },
      {
        id: 'rev_003',
        created_at: new Date('2024-01-31T23:59:59Z'),
        amount: 150000,
        product_name: '商品C',
        status: 'completed',
      },
    ];

    const report = generateMonthlyRevenueReport(
      revenue_records,
      period_start,
      period_end
    );

    expect(report.included_records.length).toBe(2);
    expect(report.included_records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'rev_001',
          product_name: '商品A',
          amount: 100000,
        }),
        expect.objectContaining({
          id: 'rev_003',
          product_name: '商品C',
          amount: 150000,
        }),
      ])
    );
    expect(report.total_revenue).toBe(250000);
    expect(report.excluded_records.length).toBe(1);
    expect(report.excluded_records[0].id).toBe('rev_002');
  });
});