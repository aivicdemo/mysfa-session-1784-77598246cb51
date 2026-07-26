import { detectRevenueRecognitionDateDiscrepancy } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 商談情報参照機能', () => {
  // SCEN-088
  test('売上計上予定日と請求発行日のズレが1日の場合、許容範囲内として検出されない', () => {
    const revenueRecognitionDate = new Date('2024-01-15T00:00:00Z');
    const invoiceIssuanceDate = new Date('2024-01-16T00:00:00Z');
    const toleranceDays = 1;

    const result = detectRevenueRecognitionDateDiscrepancy({
      revenueRecognitionDate,
      invoiceIssuanceDate,
      toleranceDays,
    });

    expect(result.isDiscrepancyDetected).toBe(false);
    expect(result.discrepancyDays).toBe(1);
    expect(result.alertMessage).toBe('');
  });
});