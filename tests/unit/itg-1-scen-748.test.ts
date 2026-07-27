import { reconcileDealAndInvoices } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  test('SCEN-748: 請求書が複数件で、請求明細の合計金額が商談金額と一致する場合、照合は成功する', () => {
    // Arrange: テストデータの構築
    const deal_id = 'DEAL-001';
    const deal_amount = 150000;

    const invoice_1 = {
      invoice_id: 'INV-001',
      deal_id: deal_id,
      invoice_amount: 90000,
    };

    const invoice_2 = {
      invoice_id: 'INV-002',
      deal_id: deal_id,
      invoice_amount: 60000,
    };

    const invoice_line_1 = {
      line_id: 'LINE-001',
      invoice_id: invoice_1.invoice_id,
      line_amount: 50000,
    };

    const invoice_line_2 = {
      line_id: 'LINE-002',
      invoice_id: invoice_1.invoice_id,
      line_amount: 40000,
    };

    const invoice_line_3 = {
      line_id: 'LINE-003',
      invoice_id: invoice_2.invoice_id,
      line_amount: 60000,
    };

    const invoices = [invoice_1, invoice_2];
    const invoice_lines = [invoice_line_1, invoice_line_2, invoice_line_3];

    const reconciliation_timestamp = new Date('2024-01-15T11:00:00Z');

    // Act: 照合処理の実行
    const reconciliation_result = reconcileDealAndInvoices(
      deal_id,
      deal_amount,
      invoices,
      invoice_lines,
      reconciliation_timestamp
    );

    // Assert: 期待結果の検証
    expect(reconciliation_result.deal_id).toBe('DEAL-001');
    expect(reconciliation_result.reconciliation_status).toBe('成功');
    expect(reconciliation_result.deal_amount).toBe(150000);
    expect(reconciliation_result.total_invoice_line_amount).toBe(150000);
    expect(reconciliation_result.matching_judgment).toBe('〇');
    expect(reconciliation_result.is_matching).toBe(true);
    expect(reconciliation_result.reconciliation_completed_at).toEqual(
      new Date('2024-01-15T11:00:00Z')
    );
    expect(reconciliation_result.deal_status).toBe('照合完了');
  });
});