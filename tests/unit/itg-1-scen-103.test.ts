import { determineExtractionPeriod } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-103
  test('月次報告期限・データ抽出処理 - 2月の抽出対象期間が2月1日から2月29日で自動決定される（閏年）', () => {
    const leapYear = 2024;
    const februaryMonth = 2;

    const extractionPeriod = determineExtractionPeriod(leapYear, februaryMonth);

    const expectedStartDate = new Date('2024-02-01T00:00:00Z');
    const expectedEndDate = new Date('2024-02-29T23:59:59Z');
    const expectedDays = 29;

    expect(extractionPeriod.startDate.toISOString()).toBe(expectedStartDate.toISOString());
    expect(extractionPeriod.endDate.toISOString()).toBe(expectedEndDate.toISOString());
    expect(extractionPeriod.days).toBe(expectedDays);
  });
});