import { aggregateMonthlySalesTotal } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-160
  test('当月売上合計計算 - 業務上の最大規模の売上額（999,999,999円）が正確に集計される', () => {
    const salesRecords = [
      {
        sales_id: 'SALES-001',
        deal_id: 'DEAL-001',
        customer_id: 'CUST-001',
        sales_amount: 500000000,
        sales_date: '2024-04-15',
        status: '受注',
      },
      {
        sales_id: 'SALES-002',
        deal_id: 'DEAL-002',
        customer_id: 'CUST-002',
        sales_amount: 300000000,
        sales_date: '2024-04-20',
        status: '受注',
      },
      {
        sales_id: 'SALES-003',
        deal_id: 'DEAL-003',
        customer_id: 'CUST-003',
        sales_amount: 199999999,
        sales_date: '2024-04-25',
        status: '受注',
      },
    ];

    const aggregationPeriod = {
      start_date: '2024-04-01',
      end_date: '2024-04-30',
    };

    const result = aggregateMonthlySalesTotal(salesRecords, aggregationPeriod);

    expect(result.total_sales_amount).toBe(999999999);
    expect(result.sales_count).toBe(3);
    expect(result.aggregation_period).toEqual({
      start_date: '2024-04-01',
      end_date: '2024-04-30',
    });
    expect(result.display_format).toBe('999,999,999');
  });
});