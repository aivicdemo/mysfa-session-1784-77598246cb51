import { detectRevenueInvoiceDiscrepancy } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-644
  test('[normal] 売上実績と請求書のズレ解消機能 - 売上計上予定日が請求書発行日より遅いとき、マイナスのズレと検出される', () => {
    const revenueRecord = {
      salesId: 'SLS-001',
      customerId: 'CUST-100',
      amount: 100000,
      plannedRevenueDate: new Date('2024-02-15'),
    };

    const invoiceRecord = {
      invoiceId: 'INV-001',
      customerId: 'CUST-100',
      invoiceAmount: 100000,
      invoiceIssuedDate: new Date('2024-02-10'),
    };

    const discrepancyResult = detectRevenueInvoiceDiscrepancy(
      revenueRecord,
      invoiceRecord
    );

    expect(discrepancyResult.discrepancyType).toBe(
      '売上計上予定日が請求書発行日より遅い'
    );
    expect(discrepancyResult.discrepancyDays).toBe(-5);
    expect(discrepancyResult.discrepancyAmountDifference).toBe(0);
    expect(discrepancyResult.discrepancyStatus).toBe('検出済み');
    expect(discrepancyResult.warningMessage).toBe(
      '請求書より5日遅れて計上予定'
    );
    expect(discrepancyResult.linkedSalesId).toBe('SLS-001');
    expect(discrepancyResult.linkedInvoiceId).toBe('INV-001');
  });
});