import { detectRevenueInvoiceMismatch } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-642
  test('売上実績と請求書のズレ解消機能 - 売上計上予定日が請求書発行日より1日早いとき、1日のズレと検出される', () => {
    const revenueRecord = {
      revenue_id: 'SR-001',
      accrual_planned_date: new Date('2024-01-15T00:00:00Z'),
      amount: 100000,
    };

    const invoiceRecord = {
      invoice_id: 'INV-001',
      issue_date: new Date('2024-01-16T00:00:00Z'),
      amount: 100000,
      related_revenue_id: 'SR-001',
    };

    const mismatchResult = detectRevenueInvoiceMismatch(revenueRecord, invoiceRecord);

    expect(mismatchResult).toEqual({
      mismatch_days: 1,
      mismatch_type: '売上計上予定日が請求書発行日より早い',
      revenue_id: 'SR-001',
      invoice_id: 'INV-001',
    });
  });
});