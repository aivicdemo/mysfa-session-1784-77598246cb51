import { extractDealsForMonthlyReport } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-114
  test('月次報告期限・データ抽出処理 - 抽出対象期間内に作成された商談レコード0件の場合、空の商談リストが返される', () => {
    const extractionStartDate = new Date('2024-01-01T00:00:00Z');
    const extractionEndDate = new Date('2024-01-31T23:59:59Z');
    const deals = [];

    const result = extractDealsForMonthlyReport(
      deals,
      extractionStartDate,
      extractionEndDate
    );

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
    expect(result).not.toBeNull();
    expect(result).not.toBeUndefined();
    expect(result).toEqual([]);
  });
});