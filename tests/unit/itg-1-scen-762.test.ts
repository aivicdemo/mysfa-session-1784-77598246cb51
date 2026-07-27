import { extractBillingTargetData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-762
  test('請求対象データ抽出機能 - 抽出条件に合致する商談成約データが0件のとき、空配列を返す', () => {
    const extractionCriteria = {
      dealStatus: '成約',
      startDate: new Date('2024-01-01T00:00:00Z'),
      endDate: new Date('2024-01-31T23:59:59Z'),
      isBillingTarget: true,
    };

    const emptyDatabase: never[] = [];

    const result = extractBillingTargetData(extractionCriteria, emptyDatabase);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
    expect(result).toEqual([]);
  });
});