import { determineExtractionPeriod } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-104
  test('月次報告期限・データ抽出処理 - 12月から1月へのまたがりで抽出対象期間が正月月の1日から月末日に正確に決定される', () => {
    // Arrange
    const baseMonth = new Date('2025-01-15T09:00:00Z');
    const targetYear = 2025;
    const targetMonth = 1;

    // Act
    const extractionPeriod = determineExtractionPeriod(targetYear, targetMonth);

    // Assert
    const expectedStartDate = new Date('2025-01-01T00:00:00Z');
    const expectedEndDate = new Date('2025-01-31T23:59:59Z');

    expect(extractionPeriod.startDate).toEqual(expectedStartDate);
    expect(extractionPeriod.endDate).toEqual(expectedEndDate);
    expect(extractionPeriod.startDate.getFullYear()).toBe(2025);
    expect(extractionPeriod.startDate.getMonth()).toBe(0);
    expect(extractionPeriod.startDate.getDate()).toBe(1);
    expect(extractionPeriod.startDate.getHours()).toBe(0);
    expect(extractionPeriod.startDate.getMinutes()).toBe(0);
    expect(extractionPeriod.startDate.getSeconds()).toBe(0);
    expect(extractionPeriod.endDate.getFullYear()).toBe(2025);
    expect(extractionPeriod.endDate.getMonth()).toBe(0);
    expect(extractionPeriod.endDate.getDate()).toBe(31);
    expect(extractionPeriod.endDate.getHours()).toBe(23);
    expect(extractionPeriod.endDate.getMinutes()).toBe(59);
    expect(extractionPeriod.endDate.getSeconds()).toBe(59);
  });
});