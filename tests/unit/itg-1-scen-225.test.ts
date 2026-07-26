import { detectSalesAndInvoiceDiscrepancy } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-225
  test('売上計上予定日と実際の請求日のズレが解消されたことが正しく検出される', () => {
    // 初期状態：ズレが存在する場合
    const initialSalesData = {
      deal_id: 'DEAL-001',
      customer_id: 'CUST-001',
      deal_amount: 500000,
      expected_invoice_date: new Date('2024-01-15').toISOString(),
      actual_invoice_date: new Date('2024-01-20').toISOString(),
      deal_status: '受注',
    };

    const initialResult = detectSalesAndInvoiceDiscrepancy(initialSalesData);
    
    // ズレが検出されていることを確認
    expect(initialResult.has_discrepancy).toBe(true);
    expect(initialResult.discrepancy_days).toBe(5);
    expect(initialResult.discrepancy_type).toBe('遅延');
    expect(initialResult.status).toBe('未解消');

    // 実際の請求日を売上計上予定日と同じに更新
    const updatedSalesData = {
      deal_id: 'DEAL-001',
      customer_id: 'CUST-001',
      deal_amount: 500000,
      expected_invoice_date: new Date('2024-01-15').toISOString(),
      actual_invoice_date: new Date('2024-01-15').toISOString(),
      deal_status: '受注',
    };

    const updatedResult = detectSalesAndInvoiceDiscrepancy(updatedSalesData);

    // ズレが解消されたことを確認
    expect(updatedResult.has_discrepancy).toBe(false);
    expect(updatedResult.discrepancy_days).toBe(0);
    expect(updatedResult.status).toBe('解消済み');

    // レポートオブジェクトの生成確認
    expect(updatedResult.report_generated_at).toBeDefined();
    expect(typeof updatedResult.report_generated_at).toBe('string');

    // ステータスと検出フラグの整合性確認
    expect(updatedResult.detection_flag_cleared).toBe(true);
    expect(updatedResult.database_status_updated).toBe(true);

    // 売上金額が正しく反映されていることを確認
    expect(updatedResult.sales_amount).toBe(500000);
    expect(updatedResult.deal_id).toBe('DEAL-001');
  });
});