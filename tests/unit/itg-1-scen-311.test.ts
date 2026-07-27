import { generateMonthlySettlementReport } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-311
  test('月次決算レポート生成機能 - 対象期間内に商談レコードが0件のとき、売上実績・請求金額・未請求額がすべて0で集計される', () => {
    const report_period_start = new Date('2024-01-01T00:00:00Z');
    const report_period_end = new Date('2024-01-31T23:59:59Z');
    const empty_deals = [];

    const result = generateMonthlySettlementReport({
      period_start: report_period_start,
      period_end: report_period_end,
      deals: empty_deals,
    });

    expect(result).toEqual({
      period_start: report_period_start,
      period_end: report_period_end,
      total_revenue: 0,
      total_invoiced_amount: 0,
      total_uninvoiced_amount: 0,
      deal_count: 0,
    });
    expect(result.total_revenue).toBe(0);
    expect(result.total_invoiced_amount).toBe(0);
    expect(result.total_uninvoiced_amount).toBe(0);
  });
});