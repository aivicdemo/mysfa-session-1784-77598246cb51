import { detectDataInconsistencies } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-951: [edge] 売上実績・請求状況照合機能 - 移行前後で売上実績に対応する請求書が0件の場合、不整合として検出される
  test('移行前後で対応する請求書が存在しない売上実績を不整合として検出', () => {
    const pre_migration_sales_records = [
      {
        sales_id: 'SLS001',
        amount: 100000,
        sales_date: '2024-01-15',
        customer_id: 'CUST001',
      },
    ];

    const pre_migration_invoices = [];

    const post_migration_sales_records = [
      {
        sales_id: 'SLS001',
        amount: 100000,
        sales_date: '2024-01-15',
        customer_id: 'CUST001',
      },
    ];

    const post_migration_invoices = [];

    const result = detectDataInconsistencies({
      pre_migration_sales: pre_migration_sales_records,
      pre_migration_invoices: pre_migration_invoices,
      post_migration_sales: post_migration_sales_records,
      post_migration_invoices: post_migration_invoices,
    });

    expect(result.inconsistencies).toHaveLength(1);
    expect(result.inconsistencies[0].type).toBe('売上実績に対応する請求書なし');
    expect(result.inconsistencies[0].sales_id).toBe('SLS001');
    expect(result.inconsistencies[0].pre_migration_amount).toBe(100000);
    expect(result.inconsistencies[0].detection_scope).toBe('移行前後両環境');
    expect(result.inconsistencies[0].status).toBe('未解決');
    expect(result.summary.total_inconsistencies).toBe(1);
    expect(result.summary.dashboard_message).toBe('1件の不整合が検出されました');
    expect(result.flagged_sales_ids).toContain('SLS001');
  });
});