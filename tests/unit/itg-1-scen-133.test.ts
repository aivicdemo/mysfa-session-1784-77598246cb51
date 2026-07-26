import { reconcileDealStatusAndInvoiceData } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-133
  test('受注・完了商談の進捗ステータスと請求書発行日・請求金額が正しく紐付いていることを確認できる', () => {
    const test_deals = [
      {
        deal_id: 'DEAL001',
        customer_id: 'CUST001',
        customer_name: '株式会社A',
        status: '受注',
        amount: 1000000,
        expected_billing_date: '2024-04-15',
        created_at: '2024-04-01T09:00:00Z',
      },
      {
        deal_id: 'DEAL002',
        customer_id: 'CUST002',
        customer_name: '株式会社B',
        status: '完了',
        amount: 2500000,
        expected_billing_date: '2024-04-20',
        created_at: '2024-04-05T10:30:00Z',
      },
      {
        deal_id: 'DEAL003',
        customer_id: 'CUST003',
        customer_name: '株式会社C',
        status: '受注',
        amount: 500000,
        expected_billing_date: '2024-04-25',
        created_at: '2024-04-08T14:15:00Z',
      },
    ];

    const test_invoices = [
      {
        invoice_id: 'INV001',
        deal_id: 'DEAL001',
        customer_id: 'CUST001',
        invoice_amount: 1000000,
        invoice_date: '2024-04-15T00:00:00Z',
        status: '発行済み',
      },
      {
        invoice_id: 'INV002',
        deal_id: 'DEAL002',
        customer_id: 'CUST002',
        invoice_amount: 2500000,
        invoice_date: '2024-04-20T00:00:00Z',
        status: '発行済み',
      },
      {
        invoice_id: 'INV003',
        deal_id: 'DEAL003',
        customer_id: 'CUST003',
        invoice_amount: 500000,
        invoice_date: '2024-04-25T00:00:00Z',
        status: '発行済み',
      },
    ];

    const reconciliation_result = reconcileDealStatusAndInvoiceData({
      deals: test_deals,
      invoices: test_invoices,
    });

    expect(reconciliation_result).toBeDefined();
    expect(reconciliation_result.reconciled_records).toHaveLength(3);

    expect(reconciliation_result.reconciled_records[0]).toEqual({
      deal_id: 'DEAL001',
      customer_id: 'CUST001',
      customer_name: '株式会社A',
      deal_status: '受注',
      deal_amount: 1000000,
      expected_billing_date: '2024-04-15',
      invoice_id: 'INV001',
      invoice_amount: 1000000,
      invoice_date: '2024-04-15T00:00:00Z',
      invoice_status: '発行済み',
      amount_match: true,
      date_match: true,
      is_linked: true,
      discrepancy_flag: false,
      discrepancy_type: null,
    });

    expect(reconciliation_result.reconciled_records[1]).toEqual({
      deal_id: 'DEAL002',
      customer_id: 'CUST002',
      customer_name: '株式会社B',
      deal_status: '完了',
      deal_amount: 2500000,
      expected_billing_date: '2024-04-20',
      invoice_id: 'INV002',
      invoice_amount: 2500000,
      invoice_date: '2024-04-20T00:00:00Z',
      invoice_status: '発行済み',
      amount_match: true,
      date_match: true,
      is_linked: true,
      discrepancy_flag: false,
      discrepancy_type: null,
    });

    expect(reconciliation_result.reconciled_records[2]).toEqual({
      deal_id: 'DEAL003',
      customer_id: 'CUST003',
      customer_name: '株式会社C',
      deal_status: '受注',
      deal_amount: 500000,
      expected_billing_date: '2024-04-25',
      invoice_id: 'INV003',
      invoice_amount: 500000,
      invoice_date: '2024-04-25T00:00:00Z',
      invoice_status: '発行済み',
      amount_match: true,
      date_match: true,
      is_linked: true,
      discrepancy_flag: false,
      discrepancy_type: null,
    });

    expect(reconciliation_result.summary).toBeDefined();
    expect(reconciliation_result.summary.total_records).toBe(3);
    expect(reconciliation_result.summary.matched_records).toBe(3);
    expect(reconciliation_result.summary.unmatched_records).toBe(0);
    expect(reconciliation_result.summary.discrepancy_count).toBe(0);

    expect(reconciliation_result.discrepancies).toHaveLength(0);

    expect(reconciliation_result.export_data).toBeDefined();
    expect(reconciliation_result.export_data.csv).toBeDefined();
    expect(reconciliation_result.export_data.csv).toContain('DEAL001');
    expect(reconciliation_result.export_data.csv).toContain('DEAL002');
    expect(reconciliation_result.export_data.csv).toContain('DEAL003');
    expect(reconciliation_result.export_data.csv).toContain('1000000');
    expect(reconciliation_result.export_data.csv).toContain('2500000');
    expect(reconciliation_result.export_data.csv).toContain('500000');

    expect(reconciliation_result.export_data.json).toHaveLength(3);
    expect(reconciliation_result.export_data.json[0]).toMatchObject({
      deal_id: 'DEAL001',
      customer_name: '株式会社A',
      deal_status: '受注',
    });
  });
});