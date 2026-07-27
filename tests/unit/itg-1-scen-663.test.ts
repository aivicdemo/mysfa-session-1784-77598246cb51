import { reconcileSalesRevenue } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-663
  test('同一売上実績IDで複数の請求書が存在するとき、最新の請求書発行日で照合される', () => {
    const sales_revenue_id = 'SR-20240115-001';
    const invoice_amount = 100000;

    const invoices = [
      {
        invoice_id: 'INV-001',
        sales_revenue_id: sales_revenue_id,
        issued_date: new Date('2024-01-10T00:00:00Z'),
        amount: invoice_amount,
        status: 'pending',
      },
      {
        invoice_id: 'INV-002',
        sales_revenue_id: sales_revenue_id,
        issued_date: new Date('2024-01-15T00:00:00Z'),
        amount: invoice_amount,
        status: 'pending',
      },
      {
        invoice_id: 'INV-003',
        sales_revenue_id: sales_revenue_id,
        issued_date: new Date('2024-01-20T00:00:00Z'),
        amount: invoice_amount,
        status: 'pending',
      },
    ];

    const sales_revenue = {
      sales_revenue_id: sales_revenue_id,
      amount: invoice_amount,
      expected_issue_date: new Date('2024-01-20T00:00:00Z'),
    };

    const result = reconcileSalesRevenue(sales_revenue, invoices);

    expect(result.matched_invoice_id).toBe('INV-003');
    expect(result.matched_invoice_status).toBe('reconciled');
    expect(result.matched_issued_date).toEqual(new Date('2024-01-20T00:00:00Z'));
    expect(result.excluded_invoices).toEqual(['INV-001', 'INV-002']);
    expect(result.reconciliation_status).toBe('success');
  });
});