import { generateMonthlyRevenueReport } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-325
  test('月次決算レポート生成機能 - 商談レコードの売上金額が0のとき、集計結果に含まれない', async () => {
    const target_month_start = new Date('2024-01-01T00:00:00Z');
    const target_month_end = new Date('2024-01-31T23:59:59Z');

    const deal_a = {
      deal_id: 'DEAL001',
      customer_name: 'Customer A',
      revenue_amount: 100000,
      status: '成約',
      deal_date: new Date('2024-01-15T10:00:00Z'),
    };

    const deal_b = {
      deal_id: 'DEAL002',
      customer_name: 'Customer B',
      revenue_amount: 0,
      status: '成約',
      deal_date: new Date('2024-01-20T10:00:00Z'),
    };

    const deal_c = {
      deal_id: 'DEAL003',
      customer_name: 'Customer C',
      revenue_amount: 50000,
      status: '成約',
      deal_date: new Date('2024-01-25T10:00:00Z'),
    };

    const test_deals = [deal_a, deal_b, deal_c];

    const generated_report = await generateMonthlyRevenueReport({
      period_start: target_month_start,
      period_end: target_month_end,
      deals: test_deals,
    });

    const expected_total_revenue = 150000;
    const expected_included_deal_count = 2;

    expect(generated_report.total_revenue).toBe(expected_total_revenue);
    expect(generated_report.included_deals.length).toBe(expected_included_deal_count);

    const included_deal_ids = generated_report.included_deals.map(
      (deal: { deal_id: string }) => deal.deal_id
    );
    expect(included_deal_ids).toContain('DEAL001');
    expect(included_deal_ids).toContain('DEAL003');
    expect(included_deal_ids).not.toContain('DEAL002');
  });
});