import { aggregateMonthlySalesTotal } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-127
  test('当月売上集計機能 - 当月商談が1件のとき売上合計がその商談金額と一致する', () => {
    const current_date = new Date('2024-01-15T09:00:00Z');
    const deal_date = new Date('2024-01-10T10:30:00Z');

    const monthly_deals = [
      {
        deal_id: 'DEAL-001',
        customer_id: 'CUST-100',
        customer_name: 'Sample Company Ltd.',
        deal_amount: 500000,
        deal_status: '成約',
        deal_date: deal_date,
      },
    ];

    const result = aggregateMonthlySalesTotal(monthly_deals, current_date);

    expect(result.monthly_sales_total).toBe(500000);
    expect(result.deal_count).toBe(1);
    expect(result.target_period_start).toEqual(new Date('2024-01-01T00:00:00Z'));
    expect(result.target_period_end).toEqual(new Date('2024-01-31T23:59:59Z'));
  });
});