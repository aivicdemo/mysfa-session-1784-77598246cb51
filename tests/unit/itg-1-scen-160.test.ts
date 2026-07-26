import { aggregateSalesAndInvoiceStatus } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-160
  test('集計対象期間の開始日と終了日が同一日の場合、その日の商談のみが集計される', () => {
    const target_date = new Date('2024-01-15T00:00:00Z');
    const deals_on_target_date = [
      {
        deal_id: 'D001',
        customer_id: 'C001',
        customer_name: '顧客A',
        amount: 100000,
        status: '受注',
        created_date: new Date('2024-01-15T09:00:00Z'),
        invoice_date: new Date('2024-01-15T10:00:00Z'),
        invoice_amount: 100000,
      },
      {
        deal_id: 'D002',
        customer_id: 'C002',
        customer_name: '顧客B',
        amount: 150000,
        status: '受注',
        created_date: new Date('2024-01-15T14:00:00Z'),
        invoice_date: new Date('2024-01-15T15:00:00Z'),
        invoice_amount: 150000,
      },
    ];

    const deals_on_other_dates = [
      {
        deal_id: 'D003',
        customer_id: 'C003',
        customer_name: '顧客C',
        amount: 75000,
        status: '受注',
        created_date: new Date('2024-01-14T10:00:00Z'),
        invoice_date: new Date('2024-01-14T11:00:00Z'),
        invoice_amount: 75000,
      },
      {
        deal_id: 'D004',
        customer_id: 'C004',
        customer_name: '顧客D',
        amount: 200000,
        status: '受注',
        created_date: new Date('2024-01-16T09:00:00Z'),
        invoice_date: new Date('2024-01-16T10:00:00Z'),
        invoice_amount: 200000,
      },
    ];

    const all_deals = [...deals_on_target_date, ...deals_on_other_dates];

    const result = aggregateSalesAndInvoiceStatus(
      all_deals,
      target_date,
      target_date
    );

    expect(result.aggregation_period_start).toEqual(target_date);
    expect(result.aggregation_period_end).toEqual(target_date);
    expect(result.total_sales_amount).toBe(250000);
    expect(result.total_invoice_amount).toBe(250000);
    expect(result.deal_count).toBe(2);
    expect(result.aggregated_deals.length).toBe(2);
    expect(result.aggregated_deals[0].deal_id).toBe('D001');
    expect(result.aggregated_deals[1].deal_id).toBe('D002');
    expect(result.has_discrepancy).toBe(false);
    expect(result.excluded_deals.length).toBe(2);
    expect(result.excluded_deals.map((d: { deal_id: string }) => d.deal_id)).toEqual([
      'D003',
      'D004',
    ]);
  });
});