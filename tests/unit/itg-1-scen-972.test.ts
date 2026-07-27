import { reconcileSalesAndInvoices } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-972
  test('[edge] 売上実績・請求状況照合機能 - 照合対象期間の開始日と終了日が同一日の場合、その日のデータのみが照合対象となる', () => {
    const reconciliation_start_date = new Date('2024-01-15T00:00:00Z');
    const reconciliation_end_date = new Date('2024-01-15T23:59:59Z');

    const sales_records = [
      {
        sales_id: 'SAL_001',
        sales_amount: 100000,
        sales_date: new Date('2024-01-14T10:30:00Z'),
      },
      {
        sales_id: 'SAL_002',
        sales_amount: 250000,
        sales_date: new Date('2024-01-15T09:00:00Z'),
      },
      {
        sales_id: 'SAL_003',
        sales_amount: 150000,
        sales_date: new Date('2024-01-15T14:30:00Z'),
      },
      {
        sales_id: 'SAL_004',
        sales_amount: 300000,
        sales_date: new Date('2024-01-15T16:45:00Z'),
      },
      {
        sales_id: 'SAL_005',
        sales_amount: 200000,
        sales_date: new Date('2024-01-16T11:00:00Z'),
      },
    ];

    const invoice_records = [
      {
        invoice_id: 'INV_001',
        invoice_amount: 250000,
        invoice_date: new Date('2024-01-15T10:15:00Z'),
      },
      {
        invoice_id: 'INV_002',
        invoice_amount: 150000,
        invoice_date: new Date('2024-01-15T15:00:00Z'),
      },
      {
        invoice_id: 'INV_003',
        invoice_amount: 180000,
        invoice_date: new Date('2024-01-16T09:30:00Z'),
      },
    ];

    const result = reconcileSalesAndInvoices(
      reconciliation_start_date,
      reconciliation_end_date,
      sales_records,
      invoice_records,
    );

    expect(result.reconciled_sales_records.length).toBe(3);
    expect(result.reconciled_invoice_records.length).toBe(2);
    expect(result.total_reconciled_records_count).toBe(5);

    result.reconciled_sales_records.forEach((record) => {
      expect(record.sales_date.getTime()).toBeGreaterThanOrEqual(
        reconciliation_start_date.getTime(),
      );
      expect(record.sales_date.getTime()).toBeLessThanOrEqual(
        reconciliation_end_date.getTime(),
      );
    });

    result.reconciled_invoice_records.forEach((record) => {
      expect(record.invoice_date.getTime()).toBeGreaterThanOrEqual(
        reconciliation_start_date.getTime(),
      );
      expect(record.invoice_date.getTime()).toBeLessThanOrEqual(
        reconciliation_end_date.getTime(),
      );
    });

    const included_sales_ids = result.reconciled_sales_records.map(
      (r) => r.sales_id,
    );
    expect(included_sales_ids).toEqual(['SAL_002', 'SAL_003', 'SAL_004']);
    expect(included_sales_ids).not.toContain('SAL_001');
    expect(included_sales_ids).not.toContain('SAL_005');

    const included_invoice_ids = result.reconciled_invoice_records.map(
      (r) => r.invoice_id,
    );
    expect(included_invoice_ids).toEqual(['INV_001', 'INV_002']);
    expect(included_invoice_ids).not.toContain('INV_003');
  });
});