import { reconcileSalesAndInvoices } from '../../src/logic/it-1784969823049-1-1-1';

describe('売上実績・請求状況照合機能', () => {
  // SCEN-975
  test('照合対象期間が年度をまたぐ場合、期間に含まれるすべてのデータが照合される', () => {
    const reconciliation_start_date = new Date('2024-02-01');
    const reconciliation_end_date = new Date('2025-01-31');

    const sales_records = [
      {
        sales_id: 'SALES001',
        sales_date: new Date('2024-02-15'),
        sales_amount: 100000,
        customer_id: 'CUST001',
        deal_id: 'DEAL001',
      },
      {
        sales_id: 'SALES002',
        sales_date: new Date('2024-05-20'),
        sales_amount: 250000,
        customer_id: 'CUST002',
        deal_id: 'DEAL002',
      },
      {
        sales_id: 'SALES003',
        sales_date: new Date('2024-08-10'),
        sales_amount: 180000,
        customer_id: 'CUST003',
        deal_id: 'DEAL003',
      },
      {
        sales_id: 'SALES004',
        sales_date: new Date('2024-11-05'),
        sales_amount: 320000,
        customer_id: 'CUST004',
        deal_id: 'DEAL004',
      },
      {
        sales_id: 'SALES005',
        sales_date: new Date('2025-01-25'),
        sales_amount: 150000,
        customer_id: 'CUST005',
        deal_id: 'DEAL005',
      },
    ];

    const invoice_records = [
      {
        invoice_id: 'INV001',
        invoice_date: new Date('2024-02-25'),
        invoice_amount: 100000,
        customer_id: 'CUST001',
        deal_id: 'DEAL001',
      },
      {
        invoice_id: 'INV002',
        invoice_date: new Date('2024-05-30'),
        invoice_amount: 250000,
        customer_id: 'CUST002',
        deal_id: 'DEAL002',
      },
      {
        invoice_id: 'INV003',
        invoice_date: new Date('2024-08-20'),
        invoice_amount: 180000,
        customer_id: 'CUST003',
        deal_id: 'DEAL003',
      },
      {
        invoice_id: 'INV004',
        invoice_date: new Date('2024-11-15'),
        invoice_amount: 320000,
        customer_id: 'CUST004',
        deal_id: 'DEAL004',
      },
      {
        invoice_id: 'INV005',
        invoice_date: new Date('2025-01-31'),
        invoice_amount: 150000,
        customer_id: 'CUST005',
        deal_id: 'DEAL005',
      },
    ];

    const result = reconcileSalesAndInvoices({
      start_date: reconciliation_start_date,
      end_date: reconciliation_end_date,
      sales_records: sales_records,
      invoice_records: invoice_records,
    });

    expect(result.reconciled_records_count).toBe(5);
    expect(result.total_sales_amount).toBe(900000);
    expect(result.total_invoice_amount).toBe(900000);
    expect(result.reconciliation_status).toBe('COMPLETED');
    expect(result.reconciled_items).toEqual([
      {
        deal_id: 'DEAL001',
        sales_amount: 100000,
        invoice_amount: 100000,
        difference: 0,
      },
      {
        deal_id: 'DEAL002',
        sales_amount: 250000,
        invoice_amount: 250000,
        difference: 0,
      },
      {
        deal_id: 'DEAL003',
        sales_amount: 180000,
        invoice_amount: 180000,
        difference: 0,
      },
      {
        deal_id: 'DEAL004',
        sales_amount: 320000,
        invoice_amount: 320000,
        difference: 0,
      },
      {
        deal_id: 'DEAL005',
        sales_amount: 150000,
        invoice_amount: 150000,
        difference: 0,
      },
    ]);
  });
});