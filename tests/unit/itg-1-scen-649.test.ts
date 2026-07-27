import { detectRevenueInvoiceDiscrepancy } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-649
  test('売上実績と請求書のズレ解消機能 - 売上実績の金額が請求書の金額より100万円少ないとき、100万円のズレと検出される', () => {
    // Arrange: テスト用の売上実績レコードを作成（金額: 100万円）
    const revenueRecord = {
      revenue_id: 'REV-2024-001',
      transaction_id: 'TXN-2024-001',
      customer_id: 'CUST-001',
      amount: 1000000,
      recorded_date: '2024-04-15T10:00:00Z',
    };

    // Arrange: テスト用の請求書レコードを作成（金額: 200万円）
    const invoiceRecord = {
      invoice_id: 'INV-2024-001',
      transaction_id: 'TXN-2024-001',
      customer_id: 'CUST-001',
      amount: 2000000,
      issued_date: '2024-04-15T11:00:00Z',
    };

    // Act: ズレ解消機能の差分検出ロジックを実行
    const discrepancyResult = detectRevenueInvoiceDiscrepancy(
      revenueRecord,
      invoiceRecord
    );

    // Assert: 検出されたズレ情報を確認
    expect(discrepancyResult.discrepancy_amount).toBe(1000000); // 請求書200万円 - 売上実績100万円 = 100万円
    expect(discrepancyResult.discrepancy_direction).toBe('売上実績が不足');
    expect(discrepancyResult.status).toBe('差分確認済み');
    expect(discrepancyResult.transaction_id).toBe('TXN-2024-001');
    expect(discrepancyResult.customer_id).toBe('CUST-001');
  });
});