import { reconcileSalesActualWithInvoices } from '../../src/logic/it-1784969823049-1-1-1';

describe('売上実績・請求状況照合機能', () => {
  test('SCEN-964: 売上実績に紐付く請求書が複数存在する場合、全請求書と照合が実行される', () => {
    // テストデータ準備: 売上実績レコード
    const salesActual = {
      salesActualId: 'SR-001',
      customerId: 'CUST-100',
      salesAmount: 300000,
      salesDate: '2024-01-15'
    };

    // テストデータ準備: 売上実績に紐付く3件の請求書
    const invoices = [
      {
        invoiceId: 'INV-001',
        customerId: 'CUST-100',
        invoiceAmount: 100000,
        reconciliationStatus: '未照合'
      },
      {
        invoiceId: 'INV-002',
        customerId: 'CUST-100',
        invoiceAmount: 100000,
        reconciliationStatus: '未照合'
      },
      {
        invoiceId: 'INV-003',
        customerId: 'CUST-100',
        invoiceAmount: 100000,
        reconciliationStatus: '未照合'
      }
    ];

    // 照合ロジック実行
    const reconciliationResult = reconcileSalesActualWithInvoices(
      salesActual,
      invoices
    );

    // 期待結果：照合対象請求書が3件すべて処理されたこと
    expect(reconciliationResult.processedInvoiceIds).toEqual([
      'INV-001',
      'INV-002',
      'INV-003'
    ]);

    // 期待結果：各請求書のステータスが「照合済み」に更新されたこと
    expect(reconciliationResult.reconciliationStatuses).toEqual({
      'INV-001': '照合済み',
      'INV-002': '照合済み',
      'INV-003': '照合済み'
    });

    // 期待結果：照合結果サマリーが正確に生成されたこと
    expect(reconciliationResult.summaryMessage).toBe(
      '3件の請求書を照合しました'
    );

    // 期待結果：処理対象請求書件数が3件であること
    expect(reconciliationResult.processedInvoiceCount).toBe(3);

    // 期待結果：照合実行時刻が記録されていること（ISO 8601形式）
    expect(reconciliationResult.reconciliationTimestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    );

    // 期待結果：照合対象請求書のIDが照合結果レコードに記録されていること
    expect(reconciliationResult.invoiceIds).toContain('INV-001');
    expect(reconciliationResult.invoiceIds).toContain('INV-002');
    expect(reconciliationResult.invoiceIds).toContain('INV-003');
  });
});