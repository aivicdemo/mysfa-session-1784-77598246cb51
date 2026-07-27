import { extractBillableData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-795
  test('請求対象データ抽出機能 - 商談レコードが登録されていない状態のとき、空配列が返される', () => {
    const result = extractBillableData([]);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
    expect(result).toEqual([]);
  });
});