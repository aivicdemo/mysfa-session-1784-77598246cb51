import { aggregateSalesAndBillingData } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-226
  test('売上計上予定日と実際の請求日が同一の場合、ズレなしと判定される', () => {
    const sales_record_date = new Date('2024-01-15T00:00:00Z');
    const invoice_issued_date = new Date('2024-01-15T00:00:00Z');
    
    const deal_data = {
      deal_id: 'DEAL-001',
      customer_id: 'CUST-001',
      customer_name: '株式会社テスト',
      amount: 1000000,
      status: '受注',
      scheduled_revenue_date: sales_record_date,
    };

    const invoice_data = {
      invoice_id: 'INV-001',
      deal_id: 'DEAL-001',
      invoice_issued_date: invoice_issued_date,
      invoice_amount: 1000000,
    };

    const report = aggregateSalesAndBillingData([deal_data], [invoice_data]);

    expect(report).toBeDefined();
    expect(report.discrepancies).toBeDefined();
    expect(Array.isArray(report.discrepancies)).toBe(true);
    expect(report.discrepancies.length).toBe(0);
    
    expect(report.summary).toBeDefined();
    expect(report.summary.total_sales_amount).toBe(1000000);
    expect(report.summary.matched_invoices_count).toBe(1);
    expect(report.summary.date_mismatch_count).toBe(0);
    expect(report.summary.days_variance).toBe(0);

    expect(report.details).toBeDefined();
    expect(Array.isArray(report.details)).toBe(true);
    expect(report.details.length).toBe(1);
    
    const detail = report.details[0];
    expect(detail.deal_id).toBe('DEAL-001');
    expect(detail.scheduled_revenue_date).toEqual(sales_record_date);
    expect(detail.invoice_issued_date).toEqual(invoice_issued_date);
    expect(detail.date_variance_days).toBe(0);
    expect(detail.variance_status).toBe('ズレなし');
    expect(detail.invoice_id).toBe('INV-001');
    expect(detail.customer_name).toBe('株式会社テスト');
  });
});