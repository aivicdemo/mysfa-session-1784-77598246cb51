import { validateMonthlyReportAccuracy } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-135
  test('月次営業成績報告書の売上・請求データ検証 - 報告書の進捗率がシステム元データと小数点第2位で一致する場合、検証完了と判定される', () => {
    const systemSourceData = {
      salesAmount: 1000000,
      dealCount: 10,
      invoicedAmount: 750000,
      uninvoicedAmount: 250000,
      progressRate: 75.00,
    };

    const monthlyReportData = {
      salesAmount: 1000000,
      dealCount: 10,
      invoicedAmount: 750000,
      uninvoicedAmount: 250000,
      progressRate: 75.00,
    };

    const result = validateMonthlyReportAccuracy(
      systemSourceData,
      monthlyReportData
    );

    expect(result.isValidated).toBe(true);
    expect(result.validationStatus).toBe('検証完了');
    expect(result.reportProgressRate).toBe(75.00);
    expect(result.systemProgressRate).toBe(75.00);
    expect(result.progressRateDifference).toBe(0.00);
    expect(result.matchesPrecision).toBe(true);
  });
});