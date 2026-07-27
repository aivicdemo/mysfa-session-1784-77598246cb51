import { detectSalesAndInvoiceGap } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  test('SCEN-643: 売上実績と請求書のズレ解消機能 - 売上計上予定日が請求書発行日より30日早いとき、30日のズレと検出される', () => {
    // Arrange
    const plannedSalesRecognitionDate = new Date('2024-01-15T00:00:00Z');
    const invoiceIssuanceDate = new Date('2024-02-14T00:00:00Z');

    // Act
    const gapDetectionResult = detectSalesAndInvoiceGap({
      plannedSalesRecognitionDate,
      invoiceIssuanceDate,
    });

    // Assert
    expect(gapDetectionResult.gapInDays).toBe(30);
    expect(gapDetectionResult.classification).toBe('請求書発行日が売上計上予定日より30日遅い');
    expect(gapDetectionResult.hasGap).toBe(true);
  });
});