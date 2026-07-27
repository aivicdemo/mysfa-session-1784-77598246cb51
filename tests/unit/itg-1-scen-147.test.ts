import { aggregateMonthlySalesAmount } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-147: [edge] 当月商談金額集計機能 - 商談の明細行が0件のとき商談金額0円として扱われる
  test('should treat deals with zero detail lines as 0 yen in monthly aggregation', () => {
    const current_month_start = new Date('2024-04-01T00:00:00Z');
    const current_month_end = new Date('2024-04-30T23:59:59Z');

    const deal_with_zero_details = {
      deal_id: 'DEAL-001',
      customer_id: 'CUST-001',
      customer_name: 'Test Customer',
      deal_amount: 0,
      deal_date: new Date('2024-04-15T10:00:00Z'),
      detail_lines: [],
      status: 'proposed'
    };

    const deal_with_details = {
      deal_id: 'DEAL-002',
      customer_id: 'CUST-002',
      customer_name: 'Another Customer',
      deal_amount: 150000,
      deal_date: new Date('2024-04-20T14:30:00Z'),
      detail_lines: [
        {
          line_id: 'LINE-001',
          product_name: 'Product A',
          quantity: 2,
          unit_price: 75000,
          line_amount: 150000
        }
      ],
      status: 'proposed'
    };

    const deals = [deal_with_zero_details, deal_with_details];

    const result = aggregateMonthlySalesAmount(
      deals,
      current_month_start,
      current_month_end
    );

    const expected_total_amount = 0 + 150000;
    const expected_deal_count = 2;
    const expected_deals_with_status = [
      {
        deal_id: 'DEAL-001',
        customer_name: 'Test Customer',
        deal_amount: 0,
        status: 'proposed'
      },
      {
        deal_id: 'DEAL-002',
        customer_name: 'Another Customer',
        deal_amount: 150000,
        status: 'proposed'
      }
    ];

    expect(result).toEqual({
      period_start: current_month_start,
      period_end: current_month_end,
      total_amount: expected_total_amount,
      deal_count: expected_deal_count,
      deals: expected_deals_with_status,
      calculation_completed: true
    });

    expect(result.total_amount).toBe(150000);
    expect(result.deal_count).toBe(2);
    expect(result.deals[0].deal_amount).toBe(0);
  });
});