import { detectRevenueAndInvoiceDiscrepancy } from '../../src/logic/it-1784969823049-1-1-1';

describe('売上実績・請求データ照合機能 - 期間ズレ検出', () => {
  // SCEN-934
  test('期間をまたぐ案件（売上計上予定日が前月、請求日が当月）の場合、ズレが検出される', () => {
    const revenueRecord = {
      dealId: 'DEAL-20240131-001',
      revenue: 100000,
      revenueAccrualDate: new Date('2024-01-31T00:00:00Z'),
      status: '計上済み',
    };

    const invoiceRecord = {
      dealId: 'DEAL-20240131-001',
      invoiceAmount: 100000,
      invoiceDate: new Date('2024-02-01T00:00:00Z'),
      status: '未収',
    };

    const reconciliationPeriod = {
      startDate: new Date('2024-02-01T00:00:00Z'),
      endDate: new Date('2024-02-28T23:59:59Z'),
    };

    const result = detectRevenueAndInvoiceDiscrepancy(
      revenueRecord,
      invoiceRecord,
      reconciliationPeriod
    );

    expect(result.discrepancyDetected).toBe(true);
    expect(result.dealId).toBe('DEAL-20240131-001');
    expect(result.revenueAccrualDate).toEqual(new Date('2024-01-31T00:00:00Z'));
    expect(result.invoiceDate).toEqual(new Date('2024-02-01T00:00:00Z'));
    expect(result.dateDifferenceDays).toBe(1);
    expect(result.amount).toBe(100000);
    expect(result.warningLevel).toBe('期間ズレ');
    expect(result.reconciliationStatus).toBe('要確認');
    expect(result.crossesPeriodBoundary).toBe(true);
  });
});